import datetime as dt
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch
from xml.etree import ElementTree as ET
import refresh

class PublicGraphs(unittest.TestCase):
    def test_incomplete_search_preserves_existing_graph(self):
        with TemporaryDirectory() as d, patch.object(refresh,'api',return_value={'incomplete_results':True}):
            p=Path(d)/'commits.svg'
            p.write_text('previous')
            with self.assertRaises(ValueError):
                refresh.refresh(Path(d),dt.date(2026,11,19))
            self.assertEqual([p],list(Path(d).iterdir()))
            self.assertEqual('previous',p.read_text())

    def test_completed_periods_and_permissions(self):
        def response(path):
            self.assertIn('is%3Apublic',path)
            return {'incomplete_results':False,'total_count':0,'items':[]}
        with TemporaryDirectory() as d,patch.object(refresh,'api',side_effect=response):
            data=refresh.refresh(Path(d),dt.date(2026,1,1))
            self.assertEqual(len(data['pr_days']),30)
            self.assertEqual(data['pr_days'][-1][0],'2025-12-31')
            self.assertEqual(data['public_commit_months'][-1][0],'2025-12')
            self.assertEqual(len(list(Path(d).glob('*.svg'))),4)
            for p in Path(d).glob('*.svg'): ET.parse(p)

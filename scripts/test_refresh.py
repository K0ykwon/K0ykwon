import datetime as dt
from pathlib import Path
from shutil import copytree
from tempfile import TemporaryDirectory
import unittest
from urllib.parse import parse_qs, urlsplit
from unittest.mock import patch
from xml.etree import ElementTree as ET
import refresh

class PublicGraphs(unittest.TestCase):
    def test_incomplete_later_page_splits_and_discards_the_parent_rows(self):
        calls = []
        first, last = dt.date(2026, 11, 19), dt.date(2026, 11, 20)

        def response(path):
            params = parse_qs(urlsplit(path).query)
            window = params['q'][0].split(':')[-1]
            page = int(params['page'][0])
            calls.append((window, page))
            if window == f'{first}..{last}':
                if page == 1:
                    return {'incomplete_results': False, 'total_count': 101,
                            'items': [{'id': i} for i in range(100)]}
                return {'incomplete_results': True}
            item_id = 4 if window == f'{first}..{first}' else 5
            return {'incomplete_results': False, 'total_count': 1, 'items': [{'id': item_id}]}

        with patch.object(refresh, 'api', side_effect=response):
            self.assertEqual([r['id'] for r in refresh.results(
                'issues', 'is:public', 'created', first, last)], [4, 5])
        self.assertEqual(calls, [(f'{first}..{last}', 1), (f'{first}..{last}', 2),
                                 (f'{first}..{first}', 1), (f'{last}..{last}', 1)])

    def test_limit_splits_and_single_day_overflow_fails(self):
        first = dt.date(2026, 11, 19)
        last = first + dt.timedelta(days=1)
        overflow = {'incomplete_results': False, 'total_count': 1001}
        empty = {'incomplete_results': False, 'total_count': 0, 'items': []}
        with patch.object(refresh, 'api', side_effect=[overflow, empty, overflow]) as api:
            with self.assertRaisesRegex(ValueError, str(last)):
                list(refresh.results('commits', 'is:public', 'author-date', first, last))
            self.assertEqual(api.call_count, 3)

    def test_profile_cards_show_the_successful_refresh_in_korea_time(self):
        with TemporaryDirectory() as tmp:
            assets = Path(tmp)
            copytree(refresh.ROOT / 'assets/static', assets / 'static')
            (assets / 'dynamic').mkdir()
            now = dt.datetime(2026, 11, 23, 16, 7, tzinfo=dt.UTC)
            empty = {'incomplete_results': False, 'total_count': 0, 'items': []}
            with patch.object(refresh, 'api', return_value=empty):
                data = refresh.refresh_profile(assets, now)
            self.assertEqual(data['pr_days'][-1][0], '2026-11-22')
            cards = list((assets / 'static').glob('profile*.svg'))
            self.assertEqual(len(cards), 2)
            for card in cards:
                stamp = ET.parse(card).find('.//*[@id="activity-updated"]')
                self.assertEqual(stamp.text, 'ACTIVITY UPDATED  24 NOV 2026 · 01:07 KST')
            outputs = cards + list((assets / 'dynamic').glob('*.svg'))
            self.assertEqual(len(outputs), 6)
            previous = {p: p.read_bytes() for p in outputs}
            def incomplete_commit_search(path):
                if '/search/issues?' in path:
                    return empty
                return {'incomplete_results': True}
            with patch.object(refresh, 'api', side_effect=incomplete_commit_search):
                with self.assertRaisesRegex(ValueError, 'public commits search'):
                    refresh.refresh_profile(assets, now + dt.timedelta(days=1))
            self.assertEqual(previous, {p: p.read_bytes() for p in outputs})

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

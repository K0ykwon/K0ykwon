"""Generate the public profile graphs using anonymous, read-only GitHub searches."""
import datetime as dt
import json
from pathlib import Path
import re
import tempfile
import time
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError

ROOT = Path(__file__).resolve().parents[1]

def check(ok):
    if not ok:
        raise ValueError("Incomplete or inconsistent public search response")

def month(d):
    return d.replace(day=1)

def following(d):
    return month(d + dt.timedelta(days=32))

def api(path):
    req=Request("https://api.github.com"+path,headers={"Accept":"application/vnd.github+json","User-Agent":"public-profile-refresh"})
    for retry in range(3):
        try:
            with urlopen(req,timeout=40) as res:
                return json.load(res)
        except HTTPError as err:
            if err.code not in (403,429,502,503) or retry==2:
                raise
            time.sleep(65)

def results(kind,base,qualifier,first,last):
    query=f'{base} {qualifier}:{first}..{last}'
    seen=set()
    page=1
    target=None
    while True:
        params=urlencode({'q':query,'per_page':100,'page':page,
                          'sort':'created' if kind=='issues' else 'author-date','order':'asc'})
        batch=api('/search/'+kind+'?'+params)
        check(batch['incomplete_results'] is False)
        if batch['total_count']>1000:
            check(page==1 and first<last)
            mid=first+(last-first)//2
            yield from results(kind,base,qualifier,first,mid)
            yield from results(kind,base,qualifier,mid+dt.timedelta(days=1),last)
            return
        if target is None:target=batch['total_count']
        check(batch['total_count']==target)
        for item in batch['items']:
            key=item['id'] if kind=='issues' else (item['repository']['id'],item['sha'])
            check(key not in seen)
            seen.add(key)
            yield item
        if len(seen)==target:return
        check(len(batch['items'])==100 and len(seen)<target)
        page+=1

def snapshot(today):
    start=today-dt.timedelta(days=30)
    yesterday=today-dt.timedelta(days=1)
    days={(start+dt.timedelta(days=i)).isoformat():0 for i in range(30)}
    for r in results('issues','is:public is:pr author:K0ykwon','created',start,yesterday):
        check('pull_request' in r and r['user']['login'].lower()=='k0ykwon')
        days[r['created_at'][:10]]+=1
    stop=month(today)
    first=dt.date(2025,4,1)
    months={}
    cursor=first
    while cursor<stop:
        months[cursor.strftime('%Y-%m')]=0
        cursor=following(cursor)
    # Query an extra day at each edge and apply strict UTC author timestamps locally.
    shas=set()
    for r in results('commits','author:K0ykwon is:public','author-date',first-dt.timedelta(days=1),stop):
        check(r['repository']['private'] is False and r['author']['login'].lower()=='k0ykwon')
        day=dt.datetime.fromisoformat(r['commit']['author']['date']).astimezone(dt.UTC).date()
        if not first<=day<stop or r['sha'] in shas:continue
        bot=any((r.get(k) or {}).get('type')=='Bot' or (r.get(k) or {}).get('login','').lower().endswith('[bot]') for k in ('author','committer'))
        if bot or r['commit']['message'].splitlines()[0].endswith(' - LeetHub'):continue
        shas.add(r['sha'])
        months[day.strftime('%Y-%m')]+=1
    return {'pr_days':list(days.items()),'public_commit_months':list(months.items())}

def panel(series,is_pr,mobile):
    width=400 if mobile else 900
    margin=18 if mobile else 32
    usable=width-2*margin
    total=sum(n for _,n in series)
    heading='PUBLIC PULL REQUESTS' if is_pr else 'PUBLIC INDEXED COMMITS'
    unit='opened in 30 complete UTC days' if is_pr else 'public default-branch commits'
    detail='Daily openings · UTC' if is_pr else 'Monthly totals · known automation excluded'
    first,last=series[0][0],series[-1][0]
    pieces=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="297" viewBox="0 0 {width} 297" role="img" aria-labelledby="t"><title id="t">{heading}: {total}, {first} to {last}</title><rect width="100%" height="100%" fill="black"/><g font-family="Arial,Helvetica,sans-serif" fill="#e0dcd7">']
    def label(y,txt,size,color='#e0dcd7',weight=400,x=margin,anchor='start'):
        pieces.append(f'<text x="{x}" y="{y}" text-anchor="{anchor}" fill="{color}" font-size="{size}" font-weight="{weight}">{txt}</text>')
    label(34,heading,16,'#ff574a',700)
    label(95,f'{total:,}',56,'#e0dcd7',700)
    label(124,unit,18)
    maximum=max(1,max(n for _,n in series))
    step=usable/len(series)
    for i,(d,n) in enumerate(series):
        h=64*n/maximum
        pieces.append(f'<rect x="{margin+i*step:.2f}" y="{217-max(1,h):.2f}" width="{step*.7:.2f}" height="{max(1,h):.2f}" fill="{("#ff574a" if i==len(series)-1 else "#e0dcd7") if n else "#555"}"><title>{d}: {n}</title></rect>')
    label(241,first,14);label(241,last,14,x=width-margin,anchor='end');label(277,detail,15,'#b9b4ae')
    return '\n'.join(pieces)+'</g></svg>\n'


def refresh(dest,today):
    data=snapshot(today)
    with tempfile.TemporaryDirectory(dir=dest) as tmp:
        for name,key,pr in [('public-prs','pr_days',True),('commits','public_commit_months',False)]:
            for suffix,mobile in [('',False),('-mobile',True)]:
                file=Path(tmp)/(name+suffix+'.svg')
                file.write_text(panel(data[key],pr,mobile))
        for file in sorted(Path(tmp).iterdir()):
            file.replace(dest/file.name)
    return data

def refresh_profile(assets, now):
    data = refresh(assets / 'dynamic', now.astimezone(dt.UTC).date())
    korean_time = now.astimezone(dt.timezone(dt.timedelta(hours=9)))
    stamp = korean_time.strftime('ACTIVITY UPDATED  %d %b %Y · %H:%M KST').upper()
    for name in ('profile.svg', 'profile-mobile.svg'):
        card = assets / 'static' / name
        svg, count = re.subn(r'(?<=id="activity-updated">)[^<]*(?=</text>)', stamp, card.read_text())
        if count != 1:
            raise ValueError(f'Expected one activity timestamp in {card}')
        card.write_text(svg)
    return data

if __name__=='__main__':
    data = refresh_profile(ROOT / 'assets', dt.datetime.now(dt.UTC))
    print('Public pull requests:',sum(n for _,n in data['pr_days']))
    print('Indexed public commits:',sum(n for _,n in data['public_commit_months']))

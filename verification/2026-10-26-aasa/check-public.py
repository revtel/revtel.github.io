import concurrent.futures, datetime, hashlib, json, pathlib, re, urllib.error, urllib.parse, urllib.request

root = pathlib.Path(__file__).resolve().parents[2]
evidence = root / 'verification/2026-10-26-aasa'
source = (root / 'public/.well-known/apple-app-site-association').read_bytes()
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None
opener = urllib.request.build_opener(NoRedirect)

def fetch(url, label=None, user_agent='Revtel-AASA-Verification/1.0'):
    request = urllib.request.Request(url, headers={'User-Agent': user_agent})
    try:
        response = opener.open(request, timeout=40)
    except urllib.error.HTTPError as error:
        response = error
    body = response.read()
    headers = dict(response.headers.items())
    record = {'url':url,'status':response.status,'headers':headers,'bytes':len(body),'sha256':hashlib.sha256(body).hexdigest()}
    if label:
        (evidence / (label + '.headers')).write_text(f'HTTP {response.status}\n'+str(response.headers))
        (evidence / (label + '.body')).write_bytes(body)
    return record, body

report = {'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_commit':'5ce3017b22a343d2b115bab4ce811a064362bd34','source_sha256':hashlib.sha256(source).hexdigest()}
association = [
    ('origin','https://revtel.github.io/.well-known/apple-app-site-association','Revtel-AASA-Verification/1.0'),
    ('origin-random-agent','https://revtel.github.io/.well-known/apple-app-site-association','random-aasa-check-20261026'),
    ('apple-cdn','https://app-site-association.cdn-apple.com/a/v1/revtel.github.io','Revtel-AASA-Verification/1.0'),
]
report['association'] = []
for label,url,agent in association:
    record, body = fetch(url,label,agent)
    record['label'] = label
    record['no_redirect'] = not any(k.lower() == 'location' for k in record['headers']) and record['status'] == 200
    record['matches_source_bytes'] = body == source
    try:
        record['matches_source_json'] = json.loads(body) == json.loads(source)
    except (ValueError,UnicodeDecodeError):
        record['matches_source_json'] = False
    record['json_content_type'] = next((v for k,v in record['headers'].items() if k.lower() == 'content-type'),'').split(';')[0].strip() == 'application/json'
    report['association'].append(record)
    print(label, record['status'], 'JSON MIME:',record['json_content_type'],'source JSON:',record['matches_source_json'],flush=True)

paths = ['/', '/en/', '/react-native-nfc-manager/'] + [r['/'] for r in json.loads(source)['applinks']['details'][0]['components']]
report['pages'] = []
assets = set(['/sw.js','/assets/locale.js','/assets/legacy-upgrade.js','/robots.txt','/sitemap.xml'])
for pathname in paths:
    record, body = fetch('https://revtel.github.io'+pathname)
    text = body.decode('utf-8')
    record['html_lang'] = (re.search(r'<html[^>]*\blang=[\"\']([^\"\']+)',text) or [None,None])[1]
    record['title'] = (re.search(r'<title\b[^>]*>(.*?)</title>',text,re.S) or [None,None])[1]
    record['html_page'] = '<html' in text.lower() and record['title'] is not None
    report['pages'].append(record)
    print(pathname,record['status'],record['html_lang'],record['title'],flush=True)
    if pathname in ['/', '/en/']:
        for tag in re.findall(r'<(?:script|link|img)\b[^>]+>',text):
            for asset in re.findall(r'(?:src|href)=[\"\']([^\"\']+)',tag):
                if asset.startswith('/') and not asset.startswith('//'):
                    assets.add(asset)

def check_asset(pathname):
    record, _ = fetch('https://revtel.github.io'+pathname)
    return record
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    report['assets'] = list(pool.map(check_asset,sorted(assets)))
report['regression_pass'] = all(p['status']==200 and p['html_page'] for p in report['pages']) and all(a['status']==200 for a in report['assets'])
report['origin_delivery_pass'] = all(a['status']==200 and a['no_redirect'] and a['matches_source_json'] and a['matches_source_bytes'] for a in report['association'] if a['label'].startswith('origin'))
report['origin_strict_json_mime_pass'] = all(a['status']==200 and a['no_redirect'] and a['matches_source_json'] and a['json_content_type'] for a in report['association'] if a['label'].startswith('origin'))
report['cdn_pass'] = all(a['status']==200 and a['no_redirect'] and a['matches_source_json'] and a['json_content_type'] for a in report['association'] if a['label']=='apple-cdn')
(evidence / 'public-checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('Origin delivery:',report['origin_delivery_pass'],'Origin strict JSON MIME:',report['origin_strict_json_mime_pass'],'Apple CDN:',report['cdn_pass'],'Regression:',report['regression_pass'],'assets:',len(report['assets']),flush=True)
raise SystemExit(0 if report['origin_strict_json_mime_pass'] and report['origin_delivery_pass'] and report['cdn_pass'] and report['regression_pass'] else 1)

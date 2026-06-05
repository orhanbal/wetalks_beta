import { useMemo, useState } from 'react';
// @ts-ignore
import { feature } from 'topojson-client';
// @ts-ignore
import worldTopo from 'world-atlas/countries-110m.json';

export function flagEmoji(iso: string): string {
  return iso.toUpperCase().split('').map(c =>
    String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)
  ).join('');
}

// ISO 3166-1 numeric → alpha-2
const NUM_TO_ALPHA2: Record<number, string> = {
  4:'AF',8:'AL',12:'DZ',24:'AO',32:'AR',36:'AU',40:'AT',50:'BD',56:'BE',
  64:'BT',68:'BO',70:'BA',72:'BW',76:'BR',100:'BG',104:'MM',108:'BI',
  116:'KH',120:'CM',124:'CA',140:'CF',144:'LK',148:'TD',152:'CL',156:'CN',
  158:'TW',170:'CO',178:'CG',180:'CD',188:'CR',191:'HR',196:'CY',203:'CZ',
  208:'DK',214:'DO',218:'EC',231:'ET',232:'ER',233:'EE',246:'FI',250:'FR',
  262:'DJ',266:'GA',268:'GE',276:'DE',288:'GH',300:'GR',304:'GL',320:'GT',
  324:'GN',328:'GY',332:'HT',340:'HN',348:'HU',356:'IN',360:'ID',364:'IR',
  368:'IQ',372:'IE',376:'IL',380:'IT',388:'JM',392:'JP',400:'JO',398:'KZ',
  404:'KE',408:'KP',410:'KR',414:'KW',417:'KG',418:'LA',426:'LS',428:'LV',
  422:'LB',430:'LR',434:'LY',440:'LT',450:'MG',454:'MW',458:'MY',466:'ML',
  478:'MR',484:'MX',496:'MN',498:'MD',504:'MA',508:'MZ',516:'NA',524:'NP',
  528:'NL',540:'NC',554:'NZ',558:'NI',562:'NE',566:'NG',578:'NO',586:'PK',
  591:'PA',598:'PG',600:'PY',604:'PE',608:'PH',616:'PL',620:'PT',630:'PR',
  634:'QA',642:'RO',643:'RU',646:'RW',682:'SA',686:'SN',694:'SL',703:'SK',
  705:'SI',706:'SO',710:'ZA',716:'ZW',724:'ES',728:'SS',729:'SD',740:'SR',
  752:'SE',756:'CH',760:'SY',762:'TJ',764:'TH',768:'TG',780:'TT',784:'AE',
  788:'TN',792:'TR',795:'TM',800:'UG',804:'UA',807:'MK',818:'EG',826:'GB',
  834:'TZ',840:'US',854:'BF',858:'UY',860:'UZ',862:'VE',887:'YE',894:'ZM',
  222:'SV',226:'GQ',232:'ER',242:'FJ',270:'GM',275:'PS',499:'ME',688:'RS',
  84:'BZ',90:'SB',96:'BN',112:'BY',192:'CU',204:'BJ',238:'FK',260:'TF',
  384:'CI',442:'LU',
};

// alpha-2 → display name
const COUNTRY_NAMES: Record<string, string> = {
  AF:'Afghanistan',AL:'Albania',DZ:'Algeria',AO:'Angola',AR:'Argentina',
  AU:'Australia',AT:'Austria',BD:'Bangladesh',BE:'Belgium',BT:'Bhutan',
  BO:'Bolivia',BA:'Bosnia and Herzegovina',BW:'Botswana',BR:'Brazil',
  BG:'Bulgaria',MM:'Myanmar',BI:'Burundi',KH:'Cambodia',CM:'Cameroon',
  CA:'Canada',CF:'Central African Republic',LK:'Sri Lanka',TD:'Chad',
  CL:'Chile',CN:'China',TW:'Taiwan',CO:'Colombia',CG:'Congo',
  CD:'DR Congo',CR:'Costa Rica',HR:'Croatia',CY:'Cyprus',CZ:'Czech Republic',
  DK:'Denmark',DO:'Dominican Republic',EC:'Ecuador',ET:'Ethiopia',
  ER:'Eritrea',EE:'Estonia',FI:'Finland',FR:'France',DJ:'Djibouti',
  GA:'Gabon',GE:'Georgia',DE:'Germany',GH:'Ghana',GR:'Greece',
  GL:'Greenland',GT:'Guatemala',GN:'Guinea',GY:'Guyana',HT:'Haiti',
  HN:'Honduras',HU:'Hungary',IN:'India',ID:'Indonesia',IR:'Iran',
  IQ:'Iraq',IE:'Ireland',IL:'Israel',IT:'Italy',JM:'Jamaica',
  JP:'Japan',JO:'Jordan',KZ:'Kazakhstan',KE:'Kenya',KP:'North Korea',
  KR:'South Korea',KW:'Kuwait',KG:'Kyrgyzstan',LA:'Laos',LS:'Lesotho',
  LV:'Latvia',LB:'Lebanon',LR:'Liberia',LY:'Libya',LT:'Lithuania',
  MG:'Madagascar',MW:'Malawi',MY:'Malaysia',ML:'Mali',MR:'Mauritania',
  MX:'Mexico',MN:'Mongolia',MD:'Moldova',MA:'Morocco',MZ:'Mozambique',
  NA:'Namibia',NP:'Nepal',NL:'Netherlands',NZ:'New Zealand',NI:'Nicaragua',
  NE:'Niger',NG:'Nigeria',NO:'Norway',PK:'Pakistan',PA:'Panama',
  PG:'Papua New Guinea',PY:'Paraguay',PE:'Peru',PH:'Philippines',
  PL:'Poland',PT:'Portugal',QA:'Qatar',RO:'Romania',RU:'Russia',
  RW:'Rwanda',SA:'Saudi Arabia',SN:'Senegal',SL:'Sierra Leone',SK:'Slovakia',
  SI:'Slovenia',SO:'Somalia',ZA:'South Africa',ZW:'Zimbabwe',ES:'Spain',
  SS:'South Sudan',SD:'Sudan',SR:'Suriname',SE:'Sweden',CH:'Switzerland',
  SY:'Syria',TJ:'Tajikistan',TH:'Thailand',TG:'Togo',TT:'Trinidad and Tobago',
  AE:'United Arab Emirates',TN:'Tunisia',TR:'Türkiye',TM:'Turkmenistan',
  UG:'Uganda',UA:'Ukraine',MK:'North Macedonia',EG:'Egypt',GB:'United Kingdom',
  TZ:'Tanzania',US:'United States',UY:'Uruguay',UZ:'Uzbekistan',
  VE:'Venezuela',YE:'Yemen',ZM:'Zambia',BJ:'Benin',
  BZ:'Belize',BN:'Brunei',BY:'Belarus',CU:'Cuba',GQ:'Equatorial Guinea',
  CI:"Côte d'Ivoire",LU:'Luxembourg',ME:'Montenegro',RS:'Serbia',
  PS:'Palestine',GM:'Gambia',FK:'Falkland Islands',
};

// Equirectangular projection: lon/lat → svg x/y
// viewBox "0 0 960 500"
function project(lon: number, lat: number): [number, number] {
  const x = (lon + 180) * (960 / 360);
  const y = (90 - lat) * (500 / 180);
  return [x, y];
}

// Convert a GeoJSON ring of [lon, lat] pairs → SVG path "d" string
function ringToPath(ring: [number, number][]): string {
  return ring.map((pt, i) => {
    const [x, y] = project(pt[0], pt[1]);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ') + ' Z';
}

function geomToPath(geom: { type: string; coordinates: unknown }): string {
  if (geom.type === 'Polygon') {
    const coords = geom.coordinates as [number, number][][];
    return coords.map(ringToPath).join(' ');
  }
  if (geom.type === 'MultiPolygon') {
    const coords = geom.coordinates as [number, number][][][];
    return coords.flatMap(poly => poly.map(ringToPath)).join(' ');
  }
  return '';
}

interface GeoFeature {
  id: string | number;
  geometry: { type: string; coordinates: unknown };
}

// Pre-compute features at module level (done once)
const worldFeatures = (feature(worldTopo, worldTopo.objects.countries) as { features: GeoFeature[] }).features;

interface WorldMapProps {
  countryCounts: Record<string, { name: string; count: number }>;
}

export function WorldMap({ countryCounts }: WorldMapProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const maxCount = useMemo(
    () => Math.max(...Object.values(countryCounts).map(c => c.count), 1),
    [countryCounts]
  );

  const getColor = (alpha2: string | undefined) => {
    if (!alpha2) return '#d1d5db';
    const c = countryCounts[alpha2];
    if (!c) return '#d1d5db';
    const t = Math.pow(c.count / maxCount, 0.45);
    // light sky blue → deep blue
    const r = Math.round(186 - t * 156);
    const g = Math.round(230 - t * 165);
    const b = Math.round(255 - t * 95);
    return `rgb(${r},${g},${b})`;
  };

  const topCountries = useMemo(
    () =>
      Object.entries(countryCounts)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10),
    [countryCounts]
  );

  const paths = useMemo(() =>
    worldFeatures.map(ft => {
      const numId = typeof ft.id === 'string' ? parseInt(ft.id, 10) : ft.id as number;
      const alpha2 = NUM_TO_ALPHA2[numId];
      const d = geomToPath(ft.geometry as { type: string; coordinates: unknown });
      return { alpha2, d, numId };
    }),
    []
  );

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '1.25rem 1.5rem 1rem', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111' }}>Top Locations</div>
        <div style={{ fontSize: '0.8125rem', color: '#9ca3af', marginTop: '0.125rem' }}>
          Okuyucularınızın coğrafi dağılımı
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px' }}>

        {/* SVG Map */}
        <div
          style={{ background: '#fff', padding: '1.25rem 1rem', position: 'relative', borderRight: '1px solid #f3f4f6' }}
          onMouseLeave={() => setTooltip(null)}
        >
          <svg
            viewBox="0 0 960 500"
            style={{ width: '100%', display: 'block' }}
            preserveAspectRatio="xMidYMid meet"
          >
            {paths.map(({ alpha2, d, numId }) => (
              <path
                key={numId}
                d={d}
                fill={getColor(alpha2)}
                stroke="#fff"
                strokeWidth="0.5"
                strokeLinejoin="round"
                style={{ cursor: alpha2 && countryCounts[alpha2] ? 'pointer' : 'default' }}
                onMouseEnter={e => {
                  if (!alpha2) return;
                  const name = COUNTRY_NAMES[alpha2] || alpha2;
                  const count = countryCounts[alpha2]?.count;
                  if (!count) return;
                  const svg = (e.currentTarget as SVGElement).closest('svg')!.getBoundingClientRect();
                  const pt = { x: e.clientX - svg.left, y: e.clientY - svg.top };
                  setTooltip({ x: pt.x, y: pt.y, text: `${name}: ${count} ziyaret` });
                }}
                onMouseMove={e => {
                  if (!tooltip) return;
                  const svg = (e.currentTarget as SVGElement).closest('svg')!.getBoundingClientRect();
                  setTooltip(t => t ? { ...t, x: e.clientX - svg.left, y: e.clientY - svg.top } : null);
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            ))}
          </svg>

          {tooltip && (
            <div style={{
              position: 'absolute',
              left: tooltip.x + 12,
              top: tooltip.y - 8,
              background: 'rgba(15,23,42,0.88)',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 500,
              padding: '0.3rem 0.625rem',
              borderRadius: 6,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              zIndex: 10,
            }}>
              {tooltip.text}
            </div>
          )}
        </div>

        {/* Country list */}
        <div>
          {/* Header */}
          <div style={{
            padding: '0.75rem 1.5rem',
            display: 'flex', justifyContent: 'space-between',
            fontSize: '0.6875rem', fontWeight: 700, color: '#9ca3af',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            borderBottom: '1px solid #f3f4f6',
          }}>
            <span>Ülke</span>
            <span>Ziyaret</span>
          </div>

          {topCountries.length === 0 ? (
            <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.8125rem' }}>
              Henüz lokasyon verisi yok.
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                Yeni ziyaretler otomatik kaydedilecek.
              </div>
            </div>
          ) : (
            <div>
              {topCountries.map(([iso, { name, count }], i) => (
                <div
                  key={iso}
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '0.75rem 1.5rem',
                    borderBottom: i < topCountries.length - 1 ? '1px solid #f9fafb' : 'none',
                    background: i === 0 ? '#f0f9ff' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f8faff'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = i === 0 ? '#f0f9ff' : 'transparent'; }}
                >
                  <span style={{ fontSize: '1.25rem', lineHeight: 1, flexShrink: 0, marginRight: '0.75rem' }}>
                    {flagEmoji(iso)}
                  </span>
                  <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, color: '#1e293b', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {name}
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginLeft: '1rem', flexShrink: 0 }}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

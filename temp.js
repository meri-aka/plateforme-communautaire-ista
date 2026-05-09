const fs = require('fs');
const path = require('path');

const adminDir = path.join(process.cwd(), 'frontend', 'src', 'components', 'admin');
const dirsToScan = [adminDir, path.join(adminDir, 'pages'), path.join(adminDir, 'layout')];

const tBlock = `
const T = {
  bg:    '#04060E',
  card:  '#080C18',
  cardH: '#0B1020',
  b0:    'rgba(255,255,255,0.055)',
  b1:    'rgba(255,255,255,0.11)',
  div:   'rgba(255,255,255,0.04)',
  t1:    '#EFF4FF',
  t2:    '#8899B4',
  t3:    '#3D4F6A',
  t4:    '#1A2233',
  green: '#10B981', greenBg: 'rgba(16,185,129,0.10)',
  amber: '#F59E0B', amberBg: 'rgba(245,158,11,0.10)',
  rose:  '#F43F5E', roseBg:  'rgba(244,63,94,0.10)',
  blue:  '#3B82F6', blueBg:  'rgba(59,130,246,0.10)',
  purple:'#8B5CF6', purpleBg:'rgba(139,92,246,0.10)',
};`;

dirsToScan.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx') && f !== 'AdminLayout.jsx');
  files.forEach(f => {
    const fullPath = path.join(dir, f);
    let content = fs.readFileSync(fullPath, 'utf8');

    content = content.replace(/import \{ useTheme \} from .*?;\n?/g, '');
    content = content.replace(/import \{ TOKENS \} from .*?;\n?/g, '');
    content = content.replace(/const T = TOKENS\.dark;\n?/g, '');
    content = content.replace(/^[ \t]*const \{ T \} = useTheme\(\);\n?/gm, '');

    if (!content.includes('const T = {')) {
        content = content.replace(/(import .*? from .*?;\n)(?!import)/s, '$1' + tBlock + '\n');
    }

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Restored: ' + f);
  });
});

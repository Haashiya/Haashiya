const fs = require('fs');

const files = [
  { name: 'login.html', out: 'login', css: ['/style.css'], addLayout: false },
  { name: 'archive.html', out: 'archive', css: ['/dashboard.css', '/archive.css'], addLayout: true },
  { name: 'index.html', out: 'materials', css: ['/dashboard.css'], addLayout: true }
];

const basePath = 'c:\\Users\\Dmasz\\OneDrive\\Desktop\\Hasyiyah\\public\\public\\';
const outPath = 'c:\\Users\\Dmasz\\OneDrive\\Desktop\\Hasyiyah\\src\\app\\';
const publicPath = 'c:\\Users\\Dmasz\\OneDrive\\Desktop\\Hasyiyah\\public\\';

files.forEach(f => {
  const html = fs.readFileSync(basePath + f.name, 'utf8');
  
  // Extract scripts
  let scriptContent = '';
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    if (match[1]) scriptContent += match[1] + '\n';
  }
  
  // Extract body content without scripts
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) return;
  
  let bodyContent = bodyMatch[1].replace(scriptRegex, '');
  
  const cssLinks = f.css.map(c => `<link rel="stylesheet" href="${c}" />`).join('\\n      ');
  
  let fileContent;
  if (f.addLayout) {
    fileContent = `"use client";
import React from 'react';
import Script from 'next/script';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function Page() {
  return (
    <div className="mobile-container">
      <Navbar />
      ${cssLinks}
      <div dangerouslySetInnerHTML={{ __html: \`${bodyContent.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\` }} />
      ${scriptContent ? `<Script src="/${f.out}-script.js" strategy="lazyOnload" />` : ''}
      <Footer />
    </div>
  );
}
`;
  } else {
    fileContent = `"use client";
import React from 'react';
import Script from 'next/script';

export default function Page() {
  return (
    <>
      ${cssLinks}
      <div dangerouslySetInnerHTML={{ __html: \`${bodyContent.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\` }} />
      ${scriptContent ? `<Script src="/${f.out}-script.js" strategy="lazyOnload" />` : ''}
    </>
  );
}
`;
  }

  try {
    const outDir = outPath + f.out;
    fs.writeFileSync(outDir + '\\page.tsx', fileContent);
    console.log(`Converted ${f.name} to ${f.out}/page.tsx with layout=${f.addLayout}`);
  } catch (err) {
    console.error(`Error converting ${f.name}:`, err);
  }
});

const fs = require('fs');
let content = fs.readFileSync('src/components/LoginScreen.tsx', 'utf8');

const oldStr = `        <h1
          className={\`\${
            isModal ? 'text-[22px]' : 'text-[26px]'
          } font-black text-[#191c1e] tracking-tight\`}
        >
          Kabadiwala Connect
        </h1>
        <p className="text-[13px] text-[#565e74] font-semibold mt-0.5">{t.platformSubtitle}</p>`;

const newStr = `        <h1
          className={\`\${
            isModal ? 'text-[22px]' : 'text-[26px]'
          } font-black text-[#191c1e] tracking-tight\`}
        >
          Kabadiwala Connect
        </h1>
        <p className="text-[13px] text-[#565e74] font-semibold mt-0.5">
          {language === 'mr' ? 'लॉग इन' : language === 'hi' ? 'लॉग इन' : 'Log in'}
        </p>
        <p className="text-[13px] text-[#565e74] font-semibold mt-0.5">{t.platformSubtitle}</p>`;

content = content.replace(oldStr, newStr);
fs.writeFileSync('src/components/LoginScreen.tsx', content);

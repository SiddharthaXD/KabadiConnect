const fs = require('fs');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if(file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.html') || file.endsWith('.json')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src').concat(['./index.html', './metadata.json']);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content;
    
    newContent = newContent.replace(/SmartKabadi/g, 'Kabadiwala Connect');
    newContent = newContent.replace(/स्मार्ट कबाडी/g, 'कबाडीवाला कनेक्ट');
    newContent = newContent.replace(/स्मार्ट कबाड़ी/g, 'कबाड़ीवाला कनेक्ट');

    if (content !== newContent) {
        fs.writeFileSync(file, newContent);
        console.log('Updated ' + file);
    }
});

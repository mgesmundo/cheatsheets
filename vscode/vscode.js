/// <reference path="../typings/node/node.d.ts"/>
var cheerio = require('cheerio');
var request = require('superagent');
var fs = require('fs');
var path = require('path');
var html;
var category;
var command;
var name;
var notes;
var $;
var tables;
var rows;
var columns;
var i, j;
var categories = [
  'Basic Editing',
  'Rich Languages Editing',
  'Navigation',
  'Editor/Window Management',
  'File Management',
  'Display',
  'Debug',
  'Tasks'
];
var top = [
  "cheatsheet do",
  "  title 'Visual Studio Code'",
  "  docset_file_name 'Visual_Studio_Code'",
  "  keyword 'vscode'",
  "  source_url 'http://cheat.kapeli.com'\n"
].join('\n');
var commands = '';
var bottom = [
  "  notes '* More information at https://code.visualstudio.com/Docs/customization'",
  "end"
].join('\n');
var content;

request
  .get('https://code.visualstudio.com/Docs/customization')
  .end(function (err, res) {
    if (!err) {
      // remove the scripts
      html = res.text.replace(/<script[\w\W]*<\/script>/gm, '');
      $ = cheerio.load(html);
      // get all shotcuts tables
      tables = $('.table-striped').find('tbody');
      // console.log(tables.find('tr').eq(0).text());
      for (i = 0; i < categories.length; i++) {
        category = categories[i];
        commands += "  category do\n";
        commands += "    id '" + category + "'\n";
        rows = $('tr', tables[i]);
        for (j = 0; j < rows.length; j++) {
          columns = $('td', rows[j]);
          command = $('span', columns[0]).attr('data-osx') || 'unassigned';
          command = command.replace(/\\/g,'\\\\');  	// escape '\'
          name = $('td', rows[j]).eq(1).text();
          notes = $('td', rows[j]).eq(2).text();  
          commands += "    entry do\n";
  	      commands += "      command '" + command + "'\n";
  	      commands += "      name '" + name + "'\n";
  	      commands += "      notes '`" + notes + "`'\n";
          commands += "    end\n";    
        }
          commands += "  end\n";    
      }
      content = top + '\n' + commands + '\n' + bottom;
      fs.writeFile(path.resolve('..','cheatsheets','vscode.rb'), content, function (err) {
        if (!err) {
          console.log('Done!\nConvert to docset typing:\n\n$ cheatset generate vscode.rb\n');
        }
      });
    }
  });

const fs = require("fs");
const plugin_section_end_marker = "<!--plugin-section-end-->";
const readmeTemplate = 
    "# [BetterDiscord](https://github.com/BetterDiscord/Installer) Plugins\n" +
    "If something breaks, message me on Discord: Xpl0itR#0999\n" +
    "\n" +
    "## [Plugins](/plugins)\n" +
    plugin_section_end_marker +
    "\n\n" +
    "Mozilla Public License Version 2.0\n" +
    "-------------------------------------------\n" +
    "    Copyright © 2021 Xpl0itR\n" +
    "\n" +
    "    This Source Code Form is subject to the terms of the Mozilla Public\n" +
    "    License, v. 2.0. If a copy of the MPL was not distributed with this\n" +
    "    file, You can obtain one at http://mozilla.org/MPL/2.0/.\n" +
    "\n" +
    "    If it is not possible or desirable to put the notice in a particular\n" +
    "    file, then You may include the notice in a location (such as a LICENCE\n" +
    "    file in a relevant directory) where a recipient would be likely to look\n" +
    "    for such a notice.\n" +
    "\n" +
    "    You may add additional accurate notices of copyright ownership."

function generatePluginMarkdown(name, description) { return ` - [${name}](https://raw.githubusercontent.com/Xpl0itR/BetterDiscordPlugins/master/plugins/${name}.plugin.js) - ${description}\n`; }

// Generate Plugin Lines
let pluginLines = "";
for (let pluginPath of fs.readdirSync("plugins")) {
    let pluginPrototype = require(`./plugins/${pluginPath}`).prototype;
    pluginLines += generatePluginMarkdown(pluginPrototype.getName(), pluginPrototype.getDescription());
}

// Generate README Text
let readmeLines = readmeTemplate.split("\n");
readmeLines[readmeLines.indexOf(plugin_section_end_marker)] = pluginLines + plugin_section_end_marker;
let readmeText = readmeLines.join("\n");

// Write the README File
fs.writeFileSync("README-new.md", readmeText, { encoding: "utf8" });
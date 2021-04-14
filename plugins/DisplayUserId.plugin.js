/**
 * @name DisplayUserId
 * @version 1.0.1
 * @description Displays the user's id on the user profile and popout
 * @authorId 230356924284010508
 * @source
 */
/*@cc_on
@if (@_jscript)
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();
@else@*/

const config = {
    "info": {
        "name":        "DisplayUserId",
        "version":     "1.0.1",
        "author":      "Xpl0itR",
        "description": "Displays the user's id on the user profile and popout",
        "github":      ""
    }
};

function CreateDisplayUserId() {
    [Plugin, BDFDB] = global.BDFDB_Global.PluginUtils.buildPlugin(config);

    return class DisplayUserId extends Plugin {
        onLoad() {
            this.patchedModules = {
                after: {
                    UserPopout:       "render",
                    AnalyticsContext: "render"
                }
            };
        }
        
        onStart() {
            BDFDB.PatchUtils.forceAllUpdates(this);
        }

        onStop() {
            BDFDB.PatchUtils.forceAllUpdates(this);
        }

        processUserPopout(e) {
            if (e.instance.props.user) {
                let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, { name: "CustomStatus" });
                if (index > -1)
                    this.injectUserIdText(children, 2, e.instance.props.user);
            }
        }

        processAnalyticsContext(e) {
            if (typeof e.returnvalue.props.children == "function" && e.instance.props.section == BDFDB.DiscordConstants.AnalyticsSections.PROFILE_MODAL) {
                let renderChildren = e.returnvalue.props.children;
                e.returnvalue.props.children = (...args) => {
                    let renderedChildren = renderChildren(...args);
                    let [children, index] = BDFDB.ReactUtils.findParent(renderedChildren, { name: ["DiscordTag", "ColoredFluxTag"] });
                    if (index > -1)
                        this.injectUserIdText(children, 2, children[index].props.user);
                    return renderedChildren;
                };
            }
        }

        injectUserIdText(children, index, user) {
            children.splice(index, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextScroller, {
                className: BDFDB.disCN.textrow,
                children: `User ID: ${user.id}`,
                style: {
                    color: "var(--header-secondary)"
                },
                onClick: () => {
                    navigator.clipboard.writeText(user.id);
                    global.BdApi.showToast("User ID copied to clipboard", { type: "success" });
                }
            }));
        }
    };
}

module.exports = global.BDFDB_Global
    ? CreateDisplayUserId()
    : class {
        getName()        { return config.info.name;        }
        getAuthor()      { return config.info.author;      }
        getDescription() { return config.info.description; }
        getVersion()     { return config.info.version;     }
        load() {
            global.BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText:  "Cancel",
                onConfirm: function () {
                    require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (error, response, body) => {
                        if (!error && body && response.statusCode == 200) 
                            require("fs").writeFile(require("path").join(global.BdApi.Plugins.folder, "0BDFDB.plugin.js"), body, _ => global.BdApi.showToast("Finished downloading BDFDB Library", { type: "success" }));
                        else 
                            global.BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
                    });
                }
            });
        }
        start() { }
        stop()  { }
    }

/*@end@*/
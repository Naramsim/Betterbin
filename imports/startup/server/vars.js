import { Meteor } from 'meteor/meteor';
var fs = Npm.require('fs');
var path = Npm.require('path');
const vars = {};

const config = JSON.parse(Assets.getText("path.json"));
vars.pastesNameLenght = 7;
var __ROOT_APP_PATH__;
if (config.which === "server") {
	__ROOT_APP_PATH__ = fs.realpathSync(config.pathAdjustment);
}else if (config.which === "local") {
	__ROOT_APP_PATH__ = fs.realpathSync(config.pathAdjustmentTest);
}
vars.pastesPath = path.join(__ROOT_APP_PATH__, "/pastes/");
vars.languages = JSON.parse(fs.readFileSync(path.join(__meteor_bootstrap__.serverDir, "../web.browser/app/languages.json")), "utf8");
vars.re = new RegExp("^Str@(.*)[\r\n]*^Civ:?\s?(.*)[\r\n]*^Map:?\s?(.*)[\r\n]*Name:?\s?(.*)[\r\n]*Author:?\s?(.*)[\r\n]*^Icon:\s?(.*)", "m");
vars.allowedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789£$&^";

export { vars };

console.log("Pastes are saved in: " + vars.pastesPath);


// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

const path = require("path");
module.exports = (opts)=>{
    const dir = path.resolve(__dirname);
    const assets = path.resolve(dir,"assets");
    opts = typeof opts =='object' && opts ? opts : {};
    opts.platform = "web";
    opts.assets = opts.assets || opts.alias && typeof opts.alias =='object' && opts.alias.$assets || assets;
    opts.base = opts.base || dir;
    const r = require(`@fto-consult/common/babel.config.alias`)(opts);
    const web = path.resolve(dir,"src");
    r["$wauth"] = path.resolve(web,"auth");
    r["$wcomponents"] = r["$web-components"] = path.resolve(web,"components");
    r["$wtableLink"] = r["$wTableLink"] = path.resolve(r["$wcomponents"],"TableLink");
    r.$tableLink = r.$TableLink = r.$tableLink || r.$TableLink || path.resolve(r.$wtableLink,"default");
    r["$components"] = r["$components"] || r["$wcomponents"];
    r["$wlayouts"] = r["$layouts"] = path.resolve(web,"layouts");
    r["$wmedia"] = path.resolve(web,"media");
    r["$wnavigation"] = path.resolve(web,"navigation");
    r["$wscreens"] = r["$screens"] = path.resolve(web,"screens");
    r["$wmainScreens"] = path.resolve(web,"screens","mainScreens");
    
    ///les screens principaux de l'application
    r["$mainScreens"] = r["$mainScreens"] || r["$wmainScreens"];
    r["$wscreen"] = r["$wScreen"] = path.resolve(web,"layouts/Screen");
    r["$wassets"] = path.resolve(dir,"assets");
    r["$wthemeSelectorComponent"] = path.resolve(web,"auth","ThemeSelector");
    /*** le composant permettant de sélectionner un theme utilisateur */
    r["$themeSelectorComponent"] = r["$themeSelectorComponent"] || r["$wthemeSelectorComponent"];

    r["$Screen"] = r["$Screen"] || r["$wScreen"];
    ///pour personnaliser les écrans de l'application, il suffit de redefinir l'alis $screens, pointant vers le repertoire racine des écrans personnalisés
    ///cependant, ce repertoire doit contenir un fichier mainScreens.js qui contient la liste de tous les écrans de lapplicaiton
    r["$screens"] = r["$screens"] || r["$wscreens"];
    
    r["$web"] = r["$web-ui"] = web;
    r["$wpreloader"] = path.resolve(web,"components/Preloader");
    r["$wform"] = path.resolve(web,"components","Form");
    r["$form"] = r["$form"] || r["$wform"];
    r["$wform-data"] = r["$wformData"]= path.resolve(web,"components","Form","FormData");
    r["$formData"] = r["$formData"] || r["$wformData"];
    r["$wform-manager"] = path.resolve(web,"components","Form/utils/FormManager");
    r["$wchart"] = path.resolve(web,"components","Chart");
    r["$wfile-system"] = path.resolve(web,"media","file-system");
    r["$wAssets"] = path.resolve(web,"media","Assets");
    if(!r["$screen"]){
        r["$screen"] = r["$wscreen"];
    }
    if(!r["$preloader"]){
        r["$preloader"] = r["$wpreloader"];
    }
    if(!r["$wnotify"]){
        r["$wnotify"] = r["$cnotify"];
    }
    if(!r["$chart"]){
        r["$chart"] = r["$wchart"];
    }
    if(!r["$file-system"]){
        r["$file-system"] = r["$wfile-system"];
    }
    /*** cet alias est utilisé pour modifier les différents items par défaut, rendu par le composant Drawer
     *  l'alias @drawerItems doit retourner en default, soit un tableau où un objet d'objet où une fonction
     * si c'est une fonction, alors la function est exécutée pour obtenir la liste des items à utiliser par le drawer principal
     */
    if(!r["$drawerItems"]){
        r["$drawerItems"] = path.resolve(web,"navigation","Drawer","items","default")
    }
    ///si l'alias $navigation n'a pas été définie par défaut, alors celui cet allias prendra la même valeur que celle de $wnvigation
    if(r["$navigation"] == r["$cnavigation"]){
        r["$navigation"] = r["$wnavigation"];
    }
    if(r["$loginComponent"] == r["$cloginComponent"]){
        r["$loginComponent"] = path.resolve(web,"auth","Login");
    }

    /*** alias pour le composant logo par défaut :  */
    r["$wlogoComponent"] = path.resolve(web,"components","Logo","defaultComponent");
    if(!r["$logoComponent"]){
        r["$logoComponent"] = r["$wlogoComponent"];
    }
    if(typeof opts.mutator =='function'){
        opts.mutator(r);
    }
    ///le chemin racine du projet web-ui
    r["$web-ui-root-path"] = r["$web-ui-root"]= path.resolve(web,"..");

    const HelpScreen = path.resolve(r["$wscreens"],"Help");
    /*** alias des termsOfUses */
    r.$wTermsOfUses = path.resolve(HelpScreen,"TermsOfUses","content");
    if(!r.$TermsOfUses){
        r.$TermsOfUses = r.$wTermsOfUses;
    }
    /*** alias des privacyPolicy */
    r.$wPrivacyPolicy = path.resolve(HelpScreen,"PrivacyPolicy","content");
    if(!r.$PrivacyPolicy){
        r.$PrivacyPolicy = r.$wPrivacyPolicy;
    }
    return r;
}
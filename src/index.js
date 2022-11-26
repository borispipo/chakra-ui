// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import App from "./App";
import { ColorModeScript } from '@chakra-ui/react';
import React, { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import appConfig from "$capp/config";
import notify from "$cnotify";
import webConfig from "./appConfig";
import {defaultObj} from "$cutils";

export default function renderApp(options){
    options = defaultObj(options);
    const {config} = options;
    const mainRoot = document.getElementById('root');
    const container = mainRoot ||document.createElement("div");
    if(!mainRoot){
        document.body.appendChild(container);
    }
    container.id = "root";
    appConfig.current = {...webConfig,...defaultObj(config)};
    const root = ReactDOM.createRoot(container);
    root.render(
        <StrictMode>
            <ColorModeScript />
            <App />
        </StrictMode>
    );
}
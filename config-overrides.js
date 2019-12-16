
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
const rewireTypescript = require('react-app-rewire-typescript');
const rewireReactHotLoader = require('react-app-rewire-hot-loader')
const WorkerPlugin = require('worker-plugin');

module.exports = function override(config, env) {
   // console.log("config: ", config)
   // config = rewireTypescript(config, env);
    config = rewireReactHotLoader(config, env);
    // disable eslint in webpack


    config.entry = [ 'react-hot-loader/patch',  ...config.entry];
    config.plugins = config.plugins.map(plugin => {
        if (plugin.constructor.name === 'GenerateSW') {
            return new WorkboxWebpackPlugin.InjectManifest({
                swSrc: './src/sw.js',
                swDest: 'service-worker.js'
            })
        }
        return plugin;
    });
    //config.plugins.push(new WorkerPlugin())

    config.output= { ...config.output, globalObject: 'this'};

    config.resolve.alias ={
        ...config.resolve.alias,
        "react-dom" : "@hot-loader/react-dom"
    };

   config.module.rules.push({
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader', options: { inline: true, fallback: false, publicPath: '/workers/' } }
    });
    //console.dir( config);
    return config;
};



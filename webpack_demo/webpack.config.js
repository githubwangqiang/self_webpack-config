// 引入glob.因为我们需要同步检查html模板，所以我们需要引入node的glob对象使用。在webpack.config.js文件头部引入glob
const glob=require('glob');
//优雅打包第三方类库
//在webapck.config.js中配置的方法，这种不需要你在入口文件中引入，而是webpack给你作了全局引入。这个插件就是ProvidePlugin。因为ProvidePlugin是webpack自带的插件，所以要先再webpack.config.js中引入webpack。
const webpack=require('webpack');
const path=require('path');
const uglify=require('uglifyjs-webpack-plugin');
const htmlPlugin=require('html-webpack-plugin');
const extractTextPlugin=require('extract-text-webpack-plugin');
const PurifyCSSPlugin=require('purifycss-webpack');
const copyWebpackPlugin=require('copy-webpack-plugin');

const entry=require("./webpack_config/entry_webpack.js")
var website={
    publicPath:"http://192.168.1.31:1717"
}
module.exports={
     //入口文件的配置项
    entry:entry.path,
    //出口文件的配置项
    output:{
        //输出的路径，用了Node语法
        path:path.resolve(__dirname,'dist'),
        //输出的文件名称
        filename:'[name].js',
        publicPath:website.publicPath
    },
    //模块：例如解读CSS,图片如何转换，压缩
    module:{
        rules:[
            {
                //test：用于匹配处理文件的扩展名的表达式，这个选项是必须进行配置的；
                test:/\.css$/,
                //use：loader名称，就是你要使用模块的名称，这个选项也必须进行配置，否则报错；
                //loader 相应解释：
                //style-loader 它是用来处理css文件中的url()等
                //css-loader 它是用来将css插入到页面的style标签。
                // use:['style-loader','css-loader']
                use:extractTextPlugin.extract({
                    fallback:"style-loader",
                    // use:"css-loader"
                    use:[
                        {
                            loader:'css-loader',
                            options:{importLoaders:1}
                        },
                        {loader:'postcss-loader'}
                    ]
                })
                //include/exclude:手动添加必须处理的文件（文件夹）或屏蔽不需要处理的文件（文件夹）（可选）；

                //query：为loaders提供额外的设置选项（可选）
            },{
                test:/\.(png|jpg|gif)$/,
                 //file-loader：解决引用路径的问题，拿background样式用url引入背景图来说，我们都知道，webpack最终会将各个模块打包成一个文件，因此我们样式中的url路径是相对入口html页面的，而不是相对于原始css文件所在的路径的。这就会导致图片引入失败。这个问题是用file-loader解决的，file-loader可以解析项目中的url引入（不仅限于css），根据我们的配置，将图片拷贝到相应的路径，再根据我们的配置，修改打包后文件引用路径，使之指向正确的文件。

                //url-loader：如果图片较多，会发很多http请求，会降低页面性能。这个问题可以通过url-loader解决。url-loader会将引入的图片编码，生成dataURl。相当于把图片数据翻译成一串字符。再把这串字符打包到文件中，最终只需要引入这个文件就能访问图片了。当然，如果图片较大，编码会消耗性能。因此url-loader提供了一个limit参数，小于limit字节的文件会被转为DataURl，大于limit的还会使用file-loader进行copy。
                use:[{
                    // test:/\.(png|jpg|gif)/是匹配图片文件后缀名称。
                    // use：是指定使用的loader和loader的配置参数。
                    // limit：是把小于500000B的文件打成Base64的格式，写入JS。
                    loader:'url-loader',
                    options:{
                        limit:50000,
                        //打包后的图片并没有放到images文件夹下，要放到images文件夹下，其实只需要配置我们的url-loader选项就可以了。
                        //配置图片的输出路径
                        outputPath:'/images/'
                    }
                }]
            },
            {
                test:/\.(htm|html)$/i,
                //html-withimg-loader就是我们今天的重点了，这个插件并不是很火，也是我个人喜欢的一个小loader。解决的问题就是在hmtl文件中引入<img>标签的问题。
                use:['html-withimg-loader']
            },
            {
                test:/\.less$/,
                //想正确解析成CSS，还是需要style-loader和css-loader的帮助，
                /* use: [{
                    loader: "style-loader" 
                 }, {
                     loader: "css-loader" 
                 }, {
                     loader: "less-loader"
                 }] */
                //把Lees文件分离。我们之前讲了extract-text-webpack-plugin这个插件，想把Less文件分离出来的方法跟这个几乎一样
                use:extractTextPlugin.extract({
                    fallback:'style-loader',
                    use:[
                        {loader:'css-loader'},
                        {loader:'less-loader'}
                    ]
                })
            },
            {
                test:/\.scss$/,
                /* use:[{
                    loader:'style-loader'
                },{
                    loader:'css-loader'
                },{
                    loader:'sass-loader'
                }] */
                use:extractTextPlugin.extract({
                    fallback:"style-loader",
                    use:[
                        {loader:"css-loader"},
                        {loader:"sass-loader"}
                    ]
                })
            },{
                // test:/\.css$/,
                // 对postcss.config.js配置完成后，我们还需要编写我们的loader配置。
                /* use:[
                    {loader:"style-loader"},
                    {
                        loader:'css-loader',
                        options:{
                            modules:true
                        }
                    },
                    {loader:'postcss-loader'}
                ] */
                // use:extractTextPlugin.extract({
                    // fallback:'style-loader',
                    // use:[
                        // {
                            // loader:'css-loader',
                            // options:{importLoaders:1}
                        // },
                        // {loader:'postcss-loader'}
                    // ]
                // })
            // },{
                test:/\/(jsx|js)$/,
                use:{
                    loader:'babel-loader'
                },
                exclude:/node_modules/
            }
        ]
    },
    //插件，用于生产模版和各项功能
    plugins:[
        //uglifyjs-webpack-plugin(JS压缩插件，简称uglify)。虽然uglifyjs是插件，但是webpack版本里默认已经集成，不需要再次安装。
        // new uglify(),
        //我们先把dist中的html文件剪切到src目录中，并去掉我们的JS引入代码（webpack会自动为我们引入JS），因为这才是我们真实工作的目录文件结构。
        new htmlPlugin({
            // minify：是对html文件进行压缩，removeAttrubuteQuotes是却掉属性的双引号。
            minify:{
                removeAttributeQuotes:true
            },
            // hash：为了开发中js有缓存效果，所以加入hash，这样可以有效避免缓存JS。
            hash:true,
            // template：是要打包的html模版路径和文件名称。
            template:'./src/index.html'
        }),
        //CSS分离:extract-text-webpack-plugin   把CSS单独提取出来  这里的/css/index.css是分离后的路径位置。
        // 这部配置完成后，包装代码：还要修改原来我们的style-loader和css-loader。
        new extractTextPlugin("css/index.css"),
        // PurifyCSS-webpack要依赖于purify-css这个包，所以这两个都需要安装。
        // 用webpack消除未使用的CSS
        // PurifyCSS:使用PurifyCSS可以大大减少CSS冗余，比如我们经常使用的BootStrap(140KB)就可以减少到只有35KB大小。这在实际开发当中是非常有用的。
        // 这里配置了一个paths，主要是需找html模板，purifycss根据这个配置会遍历你的文件，查找哪些css被使用了。
        // 注意：使用这个插件必须配合extract-text-webpack-plugin这个插件，这个插件在前边的课程已经讲解过了。如果你还不会请自学一下。
        new PurifyCSSPlugin({
            paths:glob.sync(path.join(__dirname,'src/*.html'))
        }),
        //在webpack.config.js里引入必须使用require，否则会报错的，这点小伙伴们一定要注意。
        //引入成功后配置我们的plugins模块，代码如下。
        //配置好后，就可以在你的入口文件中使用了，而不用再次引入了。这是一种全局的引入，在实际工作中也可以很好的规范项目所使用的第三方库。
        new webpack.ProvidePlugin({
            $:'jquery'
        }),
        //BannerPlugin插件
        //在工作中每个人写的代码都要写上备注，为的就是在发生问题时可以找到当时写代码的人。有时候也用于版权声明。
        new webpack.BannerPlugin('qiang版权所有'),
        //抽离JQuery
        //第一步：修改入口文件
        //抽离的第一步是修改入口文件，把我们的JQuery也加入到入口文件中，看下面的代码。
        //第二步：引入插件
        //我们需要引入optimize优化插件，插件里边是需要配置的，具体配置项看下面的代码。
        //minChunks一般都是固定配置，但是不写是不行的，你会打包失败。
        //filename是可以省略的，这是直接打包到了打包根目录下，我们这里直接打包到了dist文件夹下边。
        //配置完成后，我们可以先删掉以前打包的dist目录，然后用webpack再次打包，你会发现jquery被抽离了出来，并且我们的entry.js文件变的很小。

        //多个第三方类库抽离
        //在入口配置中引入vue和jquery
        //修改CommonsChunkPlugin配置
        //需要修改两个位置：
        //第一个是在name属性里把原来的字符串改为数组，因为我们要引入多个模块，所以是数组；
        //第二个是在filename属性中把我们输出的文件名改为匹配付[name],这项操作就是打包出来的名字跟随我们打包前的模块。
        //下面是我们修改的代码，你可以跟jquery抽离时对比一下。

        new webpack.optimize.CommonsChunkPlugin({
            //name对应入口文件中的名字，我们起的是jquery
            name:['jquery','vue'],
            //把文件打包到哪里，是一个路径
            filename:'assets/js/[name].min.js',
            //最小打包的文件模块数，这里直接写2就好
            minChunks:2
        }),
        //静态资源集中输出   
        //打包这些资源只需要用到copy-webpack-plugin
        //安装好后，需要在webpack.config.js文件的头部引入这个插件才可以使用。
        //配置插件:from:要打包的静态资源目录地址，这里的__dirname是指项目目录下，是node的一种语法，可以直接定位到本机的项目目录中。to:要打包到的文件夹路径，跟随output配置中的目录。所以不需要再自己加__dirname。
        new copyWebpackPlugin([{
            from:__dirname+'/src/public',
            to:'./public'
        }]),
        //在webpack3中启用热加载相当的容易，只要加入HotModuleReplacementPlugin这个插件就可以了。
        new webpack.HotModuleReplacementPlugin()
    ],
    //配置webpack开发服务功能
    devServer:{
        //contentBase:配置服务器基本运行路径，用于找到程序打包地址。
        contentBase:path.resolve(__dirname,'dist'),
        //host：服务运行地址，建议使用本机IP，这里为了讲解方便，所以用localhost。
        host:'192.168.1.31',
        //compress：服务器端压缩选型，一般设置为开启，如果你对服务器压缩感兴趣，可以自行学习。
        compress:true,
        //port：服务运行端口，建议不使用80，很容易被占用，这里使用了1717.
        port:1717
    }
}
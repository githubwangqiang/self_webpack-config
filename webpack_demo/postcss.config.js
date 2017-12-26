// 需要安装两个包postcss-loader 和autoprefixer（自动添加前缀的插件）
// postCSS推荐在项目根目录（和webpack.config.js同级），建立一个postcss.config.js文件。
module.exports={
    // 这就是对postCSS一个简单的配置，引入了autoprefixer插件。让postCSS拥有添加前缀的能力，它会根据 can i use 来增加相应的css3属性前缀。
    plugins:[
        require('autoprefixer')
    ]
}
import css from'./css/index.css';
import less from './css/black.less';
import scss from './css/white.scss';
import qiang from './common/test.js';
import $ from 'jquery';
var json=require('../config.json');
document.getElementById('json').innerHTML=json.name;
{
    let qiang = "hello webpack";
    $('#title').html(qiang);
    // document.getElementById('title').innerHTML=qiang;
}

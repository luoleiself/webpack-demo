import "@/assets/css/index.scss";
import "@/assets/css/common.scss";
import "element-ui/lib/theme-chalk/index.css";

import img from "@/assets/images/timg.jpg";

import data from "./data.xml";

import { cube, square } from "./math";

import { debounce } from "lodash";

import * as React from "react";

import $ from "jquery";
// import Vue from 'vue';
import VueRouter from "vue-router";
import Axios from "axios";

window.onload = function () {
  // console.log('hello world');
  var div = document.createElement("div");
  div.id = "app";
  document.body.appendChild(div);

  var app = document.getElementById("app");

  app.innerHTML =
    '<h1>webpack-demo</h1><p class="head">hello document</p><div class="bg_rgba"></div><div class="el-dropdown el-table"></div>';

  var imgEg = new Image();

  imgEg.src = img;
  imgEg.width = 200;

  app.appendChild(imgEg);

  // console.log(data);

  // // var vm = new Vue().$mount('#vm')
  // var vueRouter = new VueRouter();
  // var xhr = Axios.create({ timeout: 120000 });

  var btn = document.createElement("button");
  btn.innerText = "Click me";
  btn.onclick = (e) =>
    import(/* webpackChunkName: "print" */ "./print").then((module) => {
      console.log(module);
      module.printMe();
      // console.log(vm);
      // console.log(vueRouter);
      // console.log(xhr);
      // console.log(React);
      console.log(square(6));
      // console.log(TEST_NAME);
    });

  app.appendChild(btn);
  // console.log('hello world');

  console.log(cube(3));

  // console.log(_.join(['A', 'B'], 'C', 'D', 'E'));

  // console.log(process.env.NODE_ENV);

  // let baseUrl = process.env.baseURL;
  // console.log(baseUrl);
};

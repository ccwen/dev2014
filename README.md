dev2014
==============

Ksanaforge front end development toolchain

    npm install

extra steps for linux and mac

    sudo install -g component gulp react-tools jshint
    sudo gulp setup

    gulp install-nw

    if not successful , download and extract node-webkit to 
    node_webkit/osx-ia32 , node_webkit/win-ia32 node_webkit or node_webkit/linux-ia32

debugging node js script

    gulp qunit -j debuggee_browser.js
    gulp qunit --nodejs=debuggee_pure_node.js

New application

		gulp newapp -n youramazingapp

New Ksana Application (with database support)

		gulp newkapp -n youramazingapp


the following command need to be executed under application folder

New Component

		gulp newcomponent -n yourcomponent

New Module  ( common.js isomophic module)		
		
		gulp newmodule --name=yourcrossplatformmodule

Deploy  
		gulp deploy -o targetfolder

Make kdb   
		node mkdb

Get content of kdb
		gulp get -p fields.xx.xx 
		-r recursive

Run with node-webkit
		gulp nw
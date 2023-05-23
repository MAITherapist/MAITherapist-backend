lambda-local -l examples/handler_helloworld.js -h handler --watch 8008
lambda-local -l index.js -h handler -e examples/s3-put.js

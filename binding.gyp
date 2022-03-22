{
  "targets": [
    {
      "target_name": "imgmsg2rgba",
      "sources": [ "src/imgmsg2rgba.cc" ],
      'include_dirs': ["<!(node -p \"require('node-addon-api').include_dir\")"],
      'cflags!': [ '-fno-exceptions' ],
      'cflags_cc!': [ '-fno-exceptions' ],
    },
  ],
}
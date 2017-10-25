module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    uglify: {
      site : {
        options : {
          sourceMap : false,
          sourceMapName : 'build/HexAPI.min.map',
          compress: {
          //  drop_console: true
          }
        },
        src : 'source/HexAPI.js',
        dest : 'build/HexAPI.min.js'
      },
      node : {
        options : {
          sourceMap : false,
          sourceMapName : 'build/HexAPI.node.min.map',
          compress: {
          //  drop_console: true
          }
        },
        src : 'source/HexAPI.node.js',
        dest : 'build/HexAPI.node.min.js'
      }
    },

    jshint: {
      all: ['source/classes/**/*.js']
    },

    concat : {
      options : {
        sourceMap : true
      },
      dev : {
        files : {
          'source/HexAPI.js': [
            'source/classes/HexAPI.js',
            'source/classes/Engine.js',
            'source/classes/Grid.js',
            'source/classes/Hex.js',
            'source/classes/HexAPIEnd.js'
          ]
        }
      },
      node : {
        files : {
          'source/HexAPI.node.js': [
            'source/classes/HexAPI.js',
            'source/classes/Engine.js',
            'source/classes/Grid.js',
            'source/classes/Hex.js',
            'source/classes/HexAPIEnd.js',
            'source/classes/nodeExport.js'
          ]
        }
      }
    },

    watch: {
      testAndCombine : {
        files : ['source/classes/**/*.js'],
        tasks: ['concat','uglify']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  //This is to run while developing
};

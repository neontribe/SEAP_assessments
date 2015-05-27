module.exports = function(grunt){

    require("matchdep").filterAll("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      htmlhint: {
        build: {
            options: {
                'tag-pair': true,
                'tagname-lowercase': true,
                'attr-lowercase': true,
                'attr-value-double-quotes': true,
                'doctype-first': true,
                'spec-char-escape': true,
                'id-unique': true,
                'head-script-disabled': true,
                'style-disabled': true
            },
            src: ['build/*.html', '!build/stats-template.html', '!build/categories-template.html']
        }
      },
      watch: {
        files: ['src/**'],
        tasks: ['generate']
      },
      copy: {
        generate: {
          cwd: 'src',
          src: [ '**' ],
          dest: 'build',
          expand: true
        }
      },
      cssmin: {
        build: {
            src: 'build/css/style.css',
            dest: 'build/css/style.css'
        }
      },
      autoprefixer: {
        single_file: {
          options: {
            //
          },
          src: 'build/css/style.css',
          dest: 'build/css/style.css'
        },
      },
      uglify: {
        options: {
          mangle: false
        },
        my_target: {
          files: {
            'build/js/all-scripts.js': ['build/js/all-scripts.js']
          }
        }
      },
      concat: {
        js: {
          src: ['build/js/jquery.js', 'build/js/underscore.js', 'build/js/storageapi.js', 'build/js/handlebars.js', 'build/js/scripts.js'],
          dest: 'build/js/all-scripts.js'
        }
      },
      clean: {
        initial: ['build'],
        tidyup: ['build/js/jquery.js', 'build/js/scripts.js', 'build/helpers', 'build/assessment-data.json', 'build/assessment.handlebars', 'build/stats-template.html', 'build/categories-template.html']
      },
      jshint: {
        options: {
          curly: true,
          eqeqeq: true,
          eqnull: true,
          browser: true,
          globals: {
            jQuery: true
          }
        },
        files: {
          src: ['src/js/scripts.js']
        }
      },
      'compile-handlebars': {
        allStatic: {
          template: 'build/assessment.handlebars',
          templateData: 'build/assessment-data.json',
          helpers: 'build/helpers/*.js',
          output: 'build/index.html'
        }
      },
      bake: {
        options: {
          process: false
        },
        create: {
          files: {
            'build/index.html': 'build/index.html'
          }
        }
      },
      connect: {
        www: {
          options: {
            base: 'source',
            port: 4545
          }
        }
      },
      ghost: {
        test: {
          files:[{
            src: ['tests/*_test.js']
          }]
        },
        options: {
          args: {
            baseUrl: 'http://localhost:' +
              '<%= connect.www.options.port %>/'
          },
          direct: false,
          logLevel: 'error',
          printCommand: false,
          printFilePaths: true
        }
      }
    });

    grunt.registerTask('test', ['clean:initial', 'copy', 'compile-handlebaars', 'bake','htmlhint', 'jshint', 'connect', 'ghost']);
    grunt.registerTask('generate', ['clean:initial', 'copy','compile-handlebars','bake', 'htmlhint', 'jshint', 'concat', 'autoprefixer', 'clean:tidyup']);
    grunt.registerTask('generate-production', ['clean:initial','compile-handlebars', 'htmlhint', 'jshint', 'copy', 'concat', 'uglify', 'autoprefixer','cssmin', 'clean:tidyup']);
};

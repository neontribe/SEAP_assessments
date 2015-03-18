module.exports = function(grunt){

    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

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
            src: ['*.html']
        }
      },
      watch: {
        html: {
            files: ['src/*.html'],
            tasks: ['buildit']
        },
        scripts: {
            files: ['src/js/*.js'],
            tasks: ['buildit']
        },
        css: {
            files: ['src/css/*.css'],
            tasks: ['buildit']
        },
        options: {
          livereload: true
        }
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
          src: ['build/js/*.js', '!build/js/html5.js'],
          dest: 'build/js/all-scripts.js'
        }
      },
      clean: {
        initial: ['build'],
        tidyup: ['build/js/jquery.js', 'build/js/scripts.js', 'build/helpers', 'build/assessment-data.json', 'build/assessment.handlebars']
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
          template: 'src/assessment.handlebars',
          templateData: 'src/assessment-data.json',
          helpers: 'src/helpers/*.js',
          output: 'src/index.html'
        }
      }
    });
  
    grunt.registerTask('compile', ['compile-handlebars']);
    grunt.registerTask('default', []);
    grunt.registerTask('css', ['copy', 'autoprefixer', 'cssmin']);
    grunt.registerTask('js', ['copy', 'concat', 'uglify']);
    grunt.registerTask('generate', ['clean:initial','compile-handlebars', 'htmlhint', 'jshint', 'copy', 'concat', 'autoprefixer', 'clean:tidyup']);
    grunt.registerTask('generate-production', ['clean:initial','compile-handlebars', 'htmlhint', 'jshint', 'copy', 'concat', 'uglify', 'autoprefixer','cssmin', 'clean:tidyup']);
};
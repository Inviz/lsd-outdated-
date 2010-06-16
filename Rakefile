require 'lib/sass/extras'

namespace :stylesheets do
  desc 'Compile stylesheets if necessary from their Sass templates.'
  task :compile do
    system('sass -r lib/sass/extras --watch Styles:Demos/Assets/Styles --trace')
  end
  
  desc 'Compile two stylesheets: One for CSS and one for ART'
  task :separate do
    
  end
end

# frozen_string_literal: true

source "https://rubygems.org"

gemspec

gem "jekyll-sass-converter", "~> 2.2.0"
gem "sass-embedded", "~> 1.69.5"
gem "webrick", "~> 1.8"
gem "html-proofer", "~> 5.0", group: :test

platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

gem "wdm", "~> 0.2.0", :platforms => [:mingw, :x64_mingw, :mswin]

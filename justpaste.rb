require 'rubygems'
require 'sinatra'
require 'execjs'
require 'coffee-script'
require 'slim'

get '/' do
  slim :index
end

get '/paste.js' do
  coffee :paste
end

get '/jquery_paste_image_reader.js' do
  coffee :jquery_paste_image_reader
end

require 'rubygems'
require 'sinatra'
require 'execjs'
require 'coffee-script'

get '/' do
  send_file('views/index.html')
end

get '/paste.js' do
  coffee :paste
end

get '/jquery_paste_image_reader.js' do
  coffee :jquery_paste_image_reader
end

get '/clipboard/:filename' do |filename|
  send_file(File.join('views', 'clipboard', filename))
end
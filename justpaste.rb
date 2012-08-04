require 'rubygems'
require 'sinatra'
require 'execjs'
require 'coffee-script'
require 'uri'
require 'net/http'

get '/' do
  send_file('views/index.html')
end

post '/upload' do
  uri = URI('http://api.imgur.com/2/upload.json')
  res = Net::HTTP.post_form(uri, 'key'=> '5df8062c468eb678dd194db7e2216387', 'image' => params[:image])
  res.body
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

helpers do
  def base_url
    "#{request.scheme}://" + (request.port == 80 ? request.host : request.host_with_port)
  end
end

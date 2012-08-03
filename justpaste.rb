require 'rubygems'
require 'sinatra'
require 'base64'
require 'execjs'
require 'coffee-script'

get '/' do
  send_file('views/index.html')
end

post '/upload' do
  image = Base64.decode64(params[:image])
  sn = Random.rand(0...999999999)
  path = File.join('images', '%09d.png' % sn)
  File.open(path, 'wb') do |f|
    f.write(image)
  end
  "%s/images/%09d.png" % [base_url, sn]
end

get '/images/:filename' do |filename|
  send_file(File.join('images', filename))
end

get '/paste.js' do
  coffee :paste
end

get '/clipboard/:filename' do |filename|
  send_file(File.join('views', 'clipboard', filename))
end

helpers do
  def base_url
    "#{request.scheme}://" + (request.port == 80 ? request.host : request.host_with_port)
  end
end

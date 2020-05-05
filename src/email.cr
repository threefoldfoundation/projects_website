require "sendgrid"

def send_email(content : String)

    client = Sendgrid::Client.new("https://api.sendgrid.com/v3/mail/send", ENV["SEND_GRID_KEY"])
    message = Sendgrid::Message.new
    message.from = Sendgrid::Address.new(email=ENV["SUPPORT_EMAIL_FROM"], name="Conscious Internet Support ")
    message.to << Sendgrid::Address.new(email=ENV["SUPPORT_EMAIL_TO"], name="")
    message.subject = "New Alliabce joined!"
    message.content = Sendgrid::Content.new(content)
    puts message
    puts ENV["SEND_GRID_KEY"]
    puts ENV["SUPPORT_EMAIL_FROM"]
    puts ENV["SUPPORT_EMAIL_TO"]
    send = client.send message
end

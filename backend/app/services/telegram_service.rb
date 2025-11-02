class TelegramService
  include HTTParty
  base_uri "https://api.telegram.org"

  def initialize
    @bot_token = ENV["TELEGRAM_BOT_TOKEN"]
    @channel_id = ENV["TELEGRAM_CHANNEL_ID"]
  end

  def send_feedback(feedback_data)
    return unless @bot_token.present? && @channel_id.present?

    message = format_feedback_message(feedback_data)
    send_message(message)
  end

  def send_notification(body)
    return unless @bot_token.present? && @channel_id.present?

    message = format_notification_message(body)
    send_message(message)
  end

  def send_system_report(message_text)
    return unless @bot_token.present? && @channel_id.present?

    # Daily reports are sent without notification
    send_message(message_text, disable_notification: true)
  end

  private

  def format_notification_message(body)
    <<~MESSAGE
      🛎
      *Internal Notification*

      #{body}
    MESSAGE
  end

  def format_feedback_message(feedback_data)
    user = feedback_data[:user]
    <<~MESSAGE
      📝 *New Feedback*

      *From:* #{user.name || 'Unknown'} (#{user.email})
      *User ID:* #{user.id}
      *Device:* #{feedback_data[:device]}
      *App Version:* #{feedback_data[:app_version]}
      *OS Version:* #{feedback_data[:os_version]}
      *IP Address:* #{feedback_data[:ip_address]}
      *Date:* #{feedback_data[:timestamp].strftime('%Y-%m-%d %H:%M UTC')}

      *Message:*
      #{feedback_data[:message]}
    MESSAGE
  end

  def send_message(text, disable_notification: false)
    endpoint = "/bot#{@bot_token}/sendMessage"

    options = {
      body: {
        chat_id: @channel_id,
        text: text,
        parse_mode: "Markdown",
        disable_notification: disable_notification
      }
    }

    response = self.class.post(endpoint, options)

    unless response.success?
      Rails.logger.error "Failed to send Telegram message: #{response.body}"
    end

    response.success?
  rescue => e
    Rails.logger.error "Telegram service error: #{e.message}"
    false
  end
end

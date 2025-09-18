class CustomFailureApp < Devise::FailureApp
  def redirect_url
    if warden_message == :timeout
      new_user_session_path
    else
      super
    end
  end

  def respond
    if http_auth?
      http_auth
    else
      redirect
    end
  end
end
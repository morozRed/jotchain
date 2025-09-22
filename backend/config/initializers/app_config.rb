# Simple centralized accessors for environment-driven config
module AppConfig
  module_function

  def frontend_origin
    ENV["FRONTEND_ORIGIN"]
  end
end


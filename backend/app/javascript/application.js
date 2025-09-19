// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"

// Use Lexxy instead of Trix
// import "trix"
// NOTE: We are not using ActionText/Trix in the dashboard. Importing it without Trix causes JS errors that break Stimulus/Turbo.
// import "@rails/actiontext"
import "lexxy"

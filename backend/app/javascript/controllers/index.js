// Stimulus controller loader
// Use stimulus-loading with importmap pins to avoid broken relative imports and double-loading.
import { application } from "controllers/application"
import { eagerLoadControllersFrom } from "@hotwired/stimulus-loading"

eagerLoadControllersFrom("controllers", application)

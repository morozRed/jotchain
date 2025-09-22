class HealthController < ApplicationController
  allow_unauthenticated_access

  def healthz
    render json: { status: "ok" }
  end

  def readyz
    begin
      ActiveRecord::Base.connection.execute("SELECT 1")
      render json: { status: "ready" }
    rescue => e
      render json: { status: "degraded", error: e.class.name }, status: :service_unavailable
    end
  end
end


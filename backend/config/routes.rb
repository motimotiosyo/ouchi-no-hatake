Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # 認証関連API
      post "auth/register", to: "auth#register"
      post "auth/login", to: "auth#login"
      get "auth/verify", to: "auth#verify"
      delete "auth/logout", to: "auth#logout"
      post "auth/verify-email", to: "auth#verify_email"
      post "auth/resend-verification", to: "auth#resend_verification"
      post "auth/forgot_password", to: "auth#forgot_password"
      put "auth/reset_password", to: "auth#reset_password"
      get "auth/me", to: "auth#me"

      # タイムライン関連API
      resources :posts, only: [ :index, :show, :create, :update, :destroy ] do
        resource :likes, only: [ :create, :destroy ]
        resources :comments, only: [ :index, :create, :destroy ]
      end

      # 成長記録関連API
      resources :growth_records, only: [ :index, :show, :create, :update, :destroy ] do
        resource :favorite, controller: "favorite_growth_records", only: [ :create, :destroy ]
      end

      # 植物関連API
      resources :plants, only: [ :index ]

      # 家庭菜園チェッカー関連API
      get "checker/questions", to: "checker#questions"
      post "checker/diagnose", to: "checker#diagnose"

      # ユーザー関連API
      resources :users, only: [ :show ] do
        resource :follow, controller: "follows", only: [ :create, :destroy ]
        get "followers", to: "follows#followers"
        get "following", to: "follows#following"
        get "favorite_growth_records", to: "users#favorite_growth_records"
      end
      put "/users/profile", to: "users#update_profile"
    end

    get "health_check", to: "health_check#index"
  end
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/*
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest

  # Defines the root path route ("/")
  # root "posts#index"
end

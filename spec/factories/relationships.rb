# Read about factories at http://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :relationship do
    follower_id 1
    followed_id 1
  end
end

class Task < ActiveRecord::Base
  attr_accessible :dateCompleted, :dateStarted, :description, :priority, :title, :user_id
  validates :user_id, presence: true
end

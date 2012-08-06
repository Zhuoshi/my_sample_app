require 'spec_helper'

describe Task do
  let(:user) { FactoryGirl.create(:user) }
  #pending "add some examples to (or delete) #{__FILE__}"
  subject { @task }

  it { should respond_to(:title) }
  it { should respond_to(:priority) }
  it { should respond_to(:description) }
  it { should respond_to(:dateStarted) }
  it { should respond_to(:dateCompleted) }
  it { should respond_to(:user_id) }

  it { should be_valid }

  describe "when user_id is not present" do
    before { @task.user_id = nil }
    it { should_not be_valid }
  end
end

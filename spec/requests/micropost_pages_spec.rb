require 'spec_helper'

describe "MicropostPages" do
  subject { page }
  let(:user) { FactoryGirl.create(:user) }
  before { sign_in user }
  #describe "GET /micropost_pages" do
  #  it "works! (now write some real specs)" do
      # Run the generator again with the --webrat flag if you want to use webrat methods/matchers
  #    get micropost_pages_index_path
  #    response.status.should be(200)
  #  end
  #end
  describe "micropost creation" do
    before { visit root_path }

    describe "with invalid information" do

      it "should not create a micropost" do
        expect { click_button "Post" }.should_not change(Micropost, :count)
      end

      describe "error messages" do
        before { click_button "Post" }
        it { should have_content('error') }
      end
    end

    describe "with valid information" do

      before { fill_in 'micropost_content', with: "Lorem ipsum" }
      it "should create a micropost" do
        expect { click_button "Post" }.should change(Micropost, :count).by(1)
      end
    end
  end
  describe "micropost destruction" do
    before { FactoryGirl.create(:micropost, user: user) }

    describe "as correct user" do
      before { visit root_path }

      it "should delete a micropost" do
        expect { click_link "delete" }.should change(Micropost, :count).by(-1)
      end
    end
  end
end

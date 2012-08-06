class TasksController < ApplicationController
  skip_before_filter :verify_authenticity_token
  before_filter :signed_in_user, only: []# [:create, :edit, :destroy, :update]
  before_filter :correct_user,   only: [:create, :edit, :destroy, :update, :index]


  def create
    @task = current_user.tasks.build(params[:task])
    if @task.save
      flash[:success] = "Task created!"
      redirect_to root_path
    else
      @feed_items = []
      render 'static_pages/home'
    end
  end


  def index
    @tasks = Task.find(params[:user])
    flash[:success] = "Tasks found!"

    respond_to do |format|
      #format.html  # index.html.erb
      format.json  { render :json => @tasks }
    end
  end

  def edit

  end

  def update
    @task = Task.find(params[:id])
    #@task.update_attributes(params)
    @task.title =params[:Name]
    @task.description =params[:Description]
    @task.save
    flash[:success] = "Task updated!"
  end

  def destroy
    @task.destroy
    redirect_to root_path
  end

  private

  def correct_user
    @task = current_user.tasks.find_by_id(params[:id])
    redirect_to root_path if @task.nil?
  end
end
class TasksController < ApplicationController
  skip_before_filter :verify_authenticity_token
  #before_filter :signed_in_user, only: [:create, :edit, :destroy, :update, :index, :new]
  #before_filter :correct_user,   only: [:create, :edit, :destroy, :update, :index, :new]


  def create
    logger.info 'create reached'
    ntask=Hash.new
    ntask['title'] =params[:Name]
    ntask['description'] =params[:Description]
    @task = current_user.tasks.build(ntask)
    logger.info 'task created'
    @task.save
    logger.info 'task saved'
    logger.info ntask['title']
    logger.info ntask['description']
    logger.info params['Description']
    ntask['id']=@task.attributes['id']

    res={
        "status" => "ok",
        "success" => true,
        "response" => {
          "data"=> {
            "id"=> ntask['id'],
            "Name" => params[:Name],
            "Description" => params[:Description],
            "Priority" => "low",
            "Status" => ""  ,
            "DateStarted"  => "",
            "TimeStarted" => "",
            "DateDue"  => ""
              }
        }
        }
    respond_to do |format|
      #format.html  # index.html.erb
      format.json  { render :json => res }
    end
    #if @task.save
    #  flash[:success] = "Task created!"
    #end
  end


  def index
    #@tasks = Task.find(params[:user])
    @tasks = current_user.tasks
    ntasks=[]
    for ctask in @tasks
      ntask=Hash.new
      ntask['Name']=ctask.attributes['title']
      ntask['Description']=ctask.attributes['description']
      ntask['id']=ctask.attributes['id']
      ntasks.append(ntask)
    end
    flash[:success] = "Tasks found!"
    respond_to do |format|
      #format.html  # index.html.erb
      format.json  { render :json => ntasks }
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
    #res={
    #    "status" => "ok",
    #    "success" => true,}
    respond_to do |format|
      #format.html  # index.html.erb
      format.json  { render :json => {'success' => true} }
    end
  end

  def destroy
    @task = current_user.tasks.find_by_id(params[:id])
    @task.destroy
    respond_to do |format|
      #format.html  # index.html.erb
      format.json  { render :json => {'success' => true} }
    end
  end

  private

  def correct_user
    @task = current_user.tasks.find_by_id(params[:id])
    redirect_to root_path if @task.nil?
  end
end
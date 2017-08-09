$(function(){
	$('.search_button').button();
	$('.question_button').button();	

	$('#tabs').tabs();//切换tab
	$('#accordion').accordion();//折叠菜单


	//显示内容
	$.ajax({
		url:'showcontent.php',
		type:'POST',
		success:function(response,status,xhr){
			var json=$.parseJSON(response);			
			var html='';
			var arr=[];
			var summary=[];
			$.each(json,function(index,value){
				html+='<h4>'+value.user+' 发表于 '+value.date+'</h4><h3>'+value.title+'</h3><div class="editor">'+value.content+'</div><div class="bottom"><span class="comment" data-id="'+value.id+'">'+value.count+'评论</span><span class="up">收起</span></div><hr noshade="noshade" /><div class="comment_list"></div>';
			});
			$('#content').append(html);
			$.each($('.editor'),function(index,value){
				arr[index]=$(value).html();
				summary[index]=arr[index].substr(0,200);
				if(summary[index].substring(199,200)=='<'){
					summary[index]=replacePos(summary[index],200,'');
				}
				if(summary[index].substring(199,200)=='</'){	
					summary[index]=replacePos(summary[index],199,'');
				}
				if(arr[index].length>200){
					summary[index]+='...<span class="down">显示全部</span>';
					$(value).html(summary[index]);
				}
				$('.bottom .up').hide();

			});
			$.each($('.editor'),function(index,value){
				$(this).on('click','.down',function(){
					$('.editor').eq(index).html(arr[index]);
					$(this).hide();
					$('.bottom .up').eq(index).show();
				})
			});
			$.each($('.bottom'),function(index,value){
				$(this).on('click','.up',function(){
					$('.editor').eq(index).html(summary[index]);
					$(this).hide();
					$('.editor .down').eq(index).show();
				})
			});
			$.each($('.bottom'),function(index,value){
				$(this).on('click','.comment',function(){
					var comment_this=this;
					if($.cookie('user')){
						if(!$('.comment_list').eq(index).has('form').length){														
							$.ajax({//显示评论
								url:'showcomment.php',
								type:'POST',
								data:{
									titleid:$(comment_this).attr('data-id'),
								},
								beforeSend:function(jqXHR,settings){
									$('.comment_list').eq(index).append('<dl class="comment_load"><dd>正在加载评论...</dd></dl>');
								},
								success:function(response,status){
									$('.comment_list').eq(index).find('.comment_load').hide();
									var json_comment=$.parseJSON(response);	//转换JSON格式
									var count=0;//统计评论页数量
									$.each(json_comment,function(index1,value){
										count=value.count;
										$('.comment_list').eq(index).append('<dl class="comment_list_content"><dt class="comment_user">'+value.user+'</dt><dd class="comment_content">'+value.comment+'</dd><dd class="comment_date">'+value.date+'</dd></dl>');
									});//显示评论
									$('.comment_list').eq(index).append('<dl><dt><span class="load_more">加载更多评论...</span></dt></dl>');
									var page=2;
									if(page>count){
										$('.comment_list').eq(index).find('.load_more').button().off('click');
										$('.comment_list').eq(index).find('.load_more').button().hide();
									}//当page小于评论页数量，加载更多取消
									$('.comment_list').eq(index).find('.load_more').button().on('click',function(){
										$('.comment_list').eq(index).find('.load_more').button('disable');
										$.ajax({//显示下一页评论
											url:'showcomment.php',
											type:'POST',
											data:{
												titleid:$(comment_this).attr('data-id'),
												page:page,
											},
											beforeSend:function(jqXHR,settings){

											},
											success:function(response,status){
												var json_comment_more=$.parseJSON(response);	
												$.each(json_comment_more,function(index2,value){
													$('.comment_list').eq(index).find('.comment_list_content').last().after('<dl class="comment_list_content"><dt class="comment_user">'+value.user+'</dt><dd class="comment_content">'+value.comment+'</dd><dd class="comment_date">'+value.date+'</dd></dl>');
												});
												$('.comment_list').eq(index).find('.load_more').button('enable');

												page++;
												if(page>count){
													$('.comment_list').eq(index).find('.load_more').button().off('click');
													$('.comment_list').eq(index).find('.load_more').button().hide();
												}
											}
										});
									});
									//发布评论
									$('.comment_list').eq(index).append('<form><dl class="comment_publish"><dt><textarea name="comment"></textarea></dt><dd><input type="hidden" name="titleid" value="'+$(comment_this).attr('data-id')+'"/><input type="hidden" name="user" value="'+$.cookie('user')+'" /><input type="submit" name="publish" value="提交" /></dd></dl></form>');
									$('.comment_list').eq(index).find('input[type=submit]').button().click(function(){
										var _this=this;
										$('.comment_list').eq(index).find('form').ajaxSubmit({
											url:'commentadd.php',
											type:'POST',
											beforeSubmit:function(){
												$(_this).button('disable');
												$('#loading').dialog('open').html('正在发布...');
												},
											success:function(responseText,statusText){
												if(responseText){
													$('#loading').html('发布成功！');
													$(_this).button('enable');
													
													setTimeout(function(){
														var date = new Date();
														$('#loading').dialog('close');
														$('.comment_list').eq(index).prepend('<dl class="comment_content"><dt>'+$.cookie('user')+'</dt><dd>'+$('.comment_list').eq(index).find('textarea').val()+'</dd><dd>'+date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+':'+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()+'</dd></dl>');											
														$('.comment_list').eq(index).find('form').resetForm();							
														$('#loading').html('正在发布...');							
													},1000);
												}
											}
										});
									});
								},
							});
						}
						if($('.comment_list').eq(index).is(':hidden')){
							$('.comment_list').eq(index).show();
						}else{
							$('.comment_list').eq(index).hide();
						}
						
					}else{
						$('#error').dialog('open');
						setTimeout(function(){
							$('#error').dialog('close');
							$('#login').dialog('open');
						},1000);
					}
					
				})
			});			
		},
	});
	//提问
	$('.question_button').click(function(){
		if($.cookie('user')){
			$('#question').dialog('open');
		}else{
			$('#error').dialog('open');
			setTimeout(function(){
				$('#error').dialog('close');
				$('#login').dialog('open');
			},1000);
		}
	});
	$('#question').dialog({
		autoOpen:false,
		modal:true,
		resizable:false,
		width:500,
		height:400,
		buttons:{
			'发布':function(){
				$(this).ajaxSubmit({
					url:'questionadd.php',
					type:'POST',
					data:{
						user:$.cookie('user'),

					},
					beforeSubmit:function(){
					$('#question').dialog('widget').find('button').eq(1).button('disable');
					$('#loading').dialog('open').html('正在发布...');
					},
					success:function(responseText,statusText){
						$('#loading').html('发布成功！');
						$('#question').dialog('widget').find('button').eq(1).button('enable');
						
						setTimeout(function(){
							$('#loading').dialog('close');
							$('#question').dialog('close');
							$('#question').resetForm();							
							$('#loading').html('正在发布...');							
						},1000);
					}
				});
			}
		}
	});
 	 

	var ue = UE.getEditor('textarea',{
		toolbars: [
		    ['bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'superscript', 'subscript', 'removeformat', 'formatmatch', 'blockquote', 'pasteplain', '|', 'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist', ]
		],
		initialFrameHeight:150,
		initialFrameWidth:446,

	});

	if($.cookie('user')){
		$('#reg_user,#logout').show();
		$('#reg_a,#login_a').hide();
		$('#reg_user').html($.cookie('user'));
	}else{
		$('#reg_user,#logout').hide();
		$('#reg_a,#login_a').show();
	};

	$('#logout').click(function(){
		$.removeCookie('user');
		window.location.href='/zhiwen/';
	});

	$('#loading').dialog({
		autoOpen:false,
		modal:true,
		closeOnEscape:false,
		resizable:false,
		draggable:false,
		width:180,
		height:50,
	}).parent().find('.ui-dialog-titlebar').hide();

	$('#error').dialog({
		autoOpen:false,
		modal:true,
		closeOnEscape:false,
		resizable:false,
		draggable:false,
		width:180,
		height:50,
	}).parent().find('.ui-dialog-titlebar').hide();

	//注册
	$('#reg_a').click(function(){
		$('#reg').dialog('open');
	});	
	$('#reg').dialog({
		autoOpen:false,
		modal:true,
		resizable:false,
		width:340,
		height:340,
		buttons:{
			'提交':function(){
				$(this).submit();
			}
		}
	}).validate({
		showErrors:function(errorMap,errorList){
			var errors=this.numberOfInvalids();
			if(errors>0){
				$('#reg').dialog('option','height',errors*20+340);
			}else{
				$('#reg').dialog('option','height',340);
			}
			this.defaultShowErrors();
		},
		highlight:function(element,errorClass){
			$(element).css('border','1px solid #630');
			$(element).parent().find('span').html('*').removeClass('succ');
		},
		unhighlight:function(element,errorClass){
			$(element).css('border','1px solid #ccc');
			$(element).parent().find('span').html('&nbsp;').addClass('succ');
		},
		submitHandler:function(form){
			$(form).ajaxSubmit({
				url:'adduser.php',
				type:'POST',
				beforeSubmit:function(){
					$('#reg').dialog('widget').find('button').eq(1).button('disable');
					$('#loading').dialog('open');
				},
				success:function(responseText,statusText){
					$('#loading').html('数据提交成功！');
					$('#reg').dialog('widget').find('button').eq(1).button('enable');
					$.cookie('user',$('#user').val());
					setTimeout(function(){
						$('#loading').dialog('close');
						$('#reg').dialog('close');
						$('#reg').resetForm();
						$('#reg').find('span').html('*').removeClass('succ');
						$('#loading').html('数据交互中...');
						$('#reg_user,#logout').show();
						$('#reg_a,#login_a').hide();
						$('#reg_user').html($.cookie('user'));
					},1000);
					

				}
			})
		},
		errorLabelContainer:'ol.reg_error',
		wrapper:'li',
		rules:{
			user:{
				required:true,
				minlength:2,
				remote:{
					url:'isuser.php',
					type:'POST',
				}
			},
			password:{
				required:true,				
				minlength:6,
			},
			email:{
				required:true,
				email:true,
			},
		},
		messages:{
			user:{
				required:'账号不能为空',
				minlength:'账号不少于2位!',
				remote:'账号已被占用',
			},
			password:{
				required:'密码不能为空',
				minlength:'密码不少于6位!',
			},
			email:{
				required:'邮箱不能为空',
				email:'请输入正确的邮箱！',
			}

		}
	});

	//登陆
	$('#login_a').click(function(){
		$('#login').dialog('open');
	});	
	$('#login').dialog({
		autoOpen:false,
		modal:true,
		resizable:false,
		width:340,
		height:240,
		buttons:{
			'登陆':function(){
				$(this).submit();
			}
		}
	}).validate({
		showErrors:function(errorMap,errorList){
			var errors=this.numberOfInvalids();
			if(errors>0){
				$('#login').dialog('option','height',errors*20+240);
			}else{
				$('#login').dialog('option','height',240);
			}
			this.defaultShowErrors();
		},
		highlight:function(element,errorClass){
			$(element).css('border','1px solid #630');
			
		},
		unhighlight:function(element,errorClass){
			$(element).css('border','1px solid #ccc');
			
		},
		submitHandler:function(form){
			$(form).ajaxSubmit({
				url:'login.php',
				type:'POST',
				beforeSubmit:function(){
					$('#login').dialog('widget').find('button').eq(1).button('disable');
					$('#loading').dialog('open');
					$('#loading').html('用户登陆...');
				},
				success:function(responseText,statusText){
					$('#loading').html('登陆成功！');
					$('#login').dialog('widget').find('button').eq(1).button('enable');
					if($('#expire').is(':checked')){
						$.cookie('user',$('#log_user').val(),{
							expires:7,
						});
					}else{
						$.cookie('user',$('#log_user').val());
					};
					
					setTimeout(function(){
						$('#loading').dialog('close');
						$('#login').dialog('close');
						$('#login').resetForm();						
						$('#loading').html('用户登陆...');
						$('#reg_user,#logout').show();
						$('#reg_a,#login_a').hide();
						$('#reg_user').html($.cookie('user'));
					},1000);
					

				}
			})
		},
		errorLabelContainer:'ol.log_error',
		wrapper:'li',
		rules:{
			log_user:{
				required:true,				
				
			},
			log_password:{
				required:true,				
				remote:{
					url:'login.php',
					type:'POST',
					data:{
						log_user:function(){
							return $('#log_user').val();
						}
					}
				}
			},			
		},
		messages:{
			log_user:{
				required:'账号不能为空',				
			},
			log_password:{
				required:'密码不能为空',
				remote:'用户名或密码不正确！',
			},
			
		}
	});
	
	
	//邮箱自动补全
	$('#email').autocomplete({
		dely:0,
		autoFocus:true,
		source:function(request,response){
			var hosts=['qq.com','163.com','gmail.com','hotmail.com'],
				term = request.term,//获取输入值
				ix = term.indexOf('@'),//@的位置
				name = term,//用户名
				host = '',//域名
				result = [];


			//结果第一条是自己的输入
			result.push(term);

			if(ix>-1){//如果有@的时候
				name=term.slice(0,ix);//得到用户名
				host=term.slice(ix+1);//得到域名
			}

			if(name){ 
				var findedHosts=(host?$.grep(hosts,function(value,index){
					return value.indexOf(host)>-1;
				}):hosts),
				findedResult = $.map(findedHosts, function(value,index){
					return name+'@'+value;
				});
				//alert(findedHosts);

			result=result.concat(findedResult);
			}
		response(result);
		}
	});

	$('#birth').datepicker({
		dateFormat: "yy-mm-dd",
		dayNamesMin: ['日','一','二','三','四','五','六'],
		monthNames: ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
		monthNamesShort: ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
		
		//showOtherMonths :true,
		//selectOtherMonths :true,
		changeMonth: true,
		changeYear: true,
		showMonthAfterYear: true,
		//yearSuffix: "年",
		yearRange: "1980:2020"
	});

	function replacePos(strObj,pos,replaceText){
		return strObj.substr(0,pos-1)+replaceText+strObj.substr(pos,strObj.length);

	}

	
})
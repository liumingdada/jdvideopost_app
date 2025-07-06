

// ***初始化变量

var postNum=1 //发布数量 设置； 可自定义修改
var videoDir = files.getSdcardPath() + "/Pictures/1600/"; // 视频库路径 .mp5 文件基地库路径 ， 这个是可以按不同群控系统来修改的；
// var videoDir = files.getSdcardPath() + "/Download/"; // 来喜 普通文件会传到/Download/ 10个1次最多，有限制 视频库路径 .mp5 文件基地库路径 ， 需要大量发送的,暂时用电脑资源管理器
var destDir = files.getSdcardPath() + "/Pictures/"; // 相册路径 目标路径，这个是固定的


//======界面UI

// *** main JOB 主程序 开始 *** 初始准备工作 循环中要使用 每次都是变化的
// 循环发布
for (var i = 0; i < postNum; i++) {
    // 每次循环执行的发布操作
    toastLog("执行第 " + (i + 1) + " 次发布操作");
    // 移动文件 +++1. 随机取一个MP5文件 ， +++2.复制到 相册文件夹， +++3.修改为MP4，并保存变量中 返回 +++4. 更新缓存 通知系统
    var srcFileName = getRandomVideoFile(videoDir); //.mp5
    var moveOK = processMoveFile(srcFileName,videoDir,destDir)// 处理移动 改名 视频文件 + 更新缓存 通知系统; 先取到一个随机.MP5文件 ; 先设置好 初始化变量 ; 
    if(!moveOK){
        toastLog("文件移动出错 可能是循环次数超出实际存在视频数量 退出");
        break;
    }
    // 示例使用
    var resultSkuAndTitle = extractSkuAndTitle(srcFileName);
    var skuID=resultSkuAndTitle.skuID
    var title=resultSkuAndTitle.title
    if (title.length > 27) {        
        title = title.substring(0, 27);// 如果超过27个字符，只取前27位
    }

    sleep(500);

    
    processJDHelper(skuID,title) //处理京东助手 
    //检测 上传是否完成 不论成功与否，不要在未完成时 打断，设置最大超时时间
    // 设置最长等待时间（30秒）
    var maxWaitTime = 9000; // 9秒转换为毫秒
    var startTime = new Date().getTime();
    while (true) {
        // 检查是否超时
        if (new Date().getTime() - startTime > maxWaitTime) {
            toastLog("视频上传超时，等待时间超过9秒");
            break;
        }
        // 检查视频是否发布成功
        if (text("内容已经发布成功，请前往查看").exists()) {
            toastLog("执行第 " + (i + 1) + " vvv视频发布成功...vvv");
            break;
        }
        // 检查视频是否发布失败
        if (text("视频发布失败：上传失败，请稍后重试").exists()) {
            toastLog("执行第 " + (i + 1) + " ***视频发布失败...***");
            break;
        }           
        sleep(2000); // 每次检查间隔2秒
    } 

   
    sleep(1000);
    deleteDestFile(srcFileName,destDir) //7.删除当前.MP4文件 从相册中删除 ; 删除相册文件


}

toastLog("vvv 当前批次 循环完成");



//*** main JOB 结束  */

// *** 主体操作 整体流程  
//function mainJob(参数){ 主体流程 }





//====== function 方法 函数 =====================================
//ui堵塞-可以重写sleep
// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
//   }

  
function checkUploadFinished(){
          //6.检测 是否上传成功 check // 7.检测是否发布成功标识 识别// 使用函数
          checkVideoPublished().then((isPublished) => {
            if (isPublished) {           
                toastLog("视频发布成功，进行后续操作"); // 视频发布成功的操作// 继续进行下一个，                 
            } else {            
                toastLog("******视频发布失败，需要处理******");// 视频发布失败的操作// 失败 也应继续下一个， 但应留下 日志                
            }
        });
}


//处理京东内容助手 ，打开 点选
function processJDHelper(skuID,title){
    // 1.打开APP
    app.launchApp("京东内容助手")
    sleep(1000);  
    gotoBaseTab() //进入 1.创作-2.拍摄视频 基础准备工作TAB界面
    sleep(1000);  
    var confirmedVideoOK=chooseDestVideo();//点入3.相册 4.选点视频 5.确定 这个视频
    sleep(1000);

    if (confirmedVideoOK) { 
        toastLog("视频确认完成,准备配置标题 标签 关联商品...");
        sleep(2000);
        setVideoUpload(skuID,title)//5.设置视频上传 参数 发布前的各参数设置  , 需要参数 标题title；标签 购物车 点发布
        sleep(2000);
  
    }

}

//删除当前相册视频文件
function deleteDestFile(srcFileName,destDir){
  var destFileName=srcFileName.replace(".mp5", ".mp4");   
  var destFile = destDir + destFileName;
  if (files.remove(destFile)) {
    toastLog("视频文件删除成功: "+destFileName);
  } else {
    toastLog("视频文件删除失败或文件不存在");
  }
  sleep(3000)
  //  .hwbk : .10101383556763 喜欢只是一瞬间而爱却是一辈子.mp4.hwbk
  var hwbkFile =destDir +"."+  destFileName +".hwbk";
  let new_name = hwbkFile + '.fuck_hwbk';
  files.move(hwbkFile, new_name);  
  if (files.remove(new_name)) {
    toastLog(".hwbk华为备份文件删除成功:"+hwbkFile);
  } else {
    toastLog(".hwbk华为备份文件删除失败或文件不存在");
  }

}



// 视频上传设置
//1.确定  2.标题 输入 3.1兴趣标签-其他/生活随拍-生活记录/生活经验 3.2.体裁标签 4.关联商品 5.话题*** 略 7.发布 8.发布结束 标识 识别， 已发布好否

function setVideoUpload(skuID,title){
    // 2.标题 输入    
    var titleInput = text("请输入视频标题，字数限制5-27字").findOnce();
    if (titleInput) {        
        titleInput.click();// 点击输入框使其获得焦点        
        titleInput.setText(title);// 在输入框中输入标题
        toastLog("标题已输入:"+title);
    } else {
        toastLog("未找到标题输入框");
    }
    sleep(500);
  
    // //3.标签： 3.1兴趣标签 + 3.2体裁标签 
    // setTag_XingQu() //3.1兴趣标签
    // sleep(500);
    // setTag_TiCai()  //3.2体裁标签 
    // sleep(500);
    // 4.关联商品 //需要行执行 添加购物车 过程 
    setAddPro(skuID)
    sleep(1000);
    // 5.话题*** 略 
    // 6.发布 
    widget = text("立即发布").findOnce() 
    if (widget) {
        click(widget.bounds().centerX(), widget.bounds().centerY());
        toastLog('已点  立即发布...');
    } else {
        toastLog('未识别立即发布...');
    }
    toastLog('发布中... 等待 发布完成提示...');
    // sleep(3000);
  }






// 3.标签 3.1-兴趣标签 //默认其它  或 忽略；以后改为 自定义输入 大类 > 小类 
function setTag_XingQu(){
  //do nothing ...
}
// 3.标签 3.2-体裁标签 
function setTag_TiCai(){
  var widget = text("选择体裁标签").findOnce() 
  if (widget) {
      click(widget.bounds().centerX(), widget.bounds().centerY());
      toastLog('已点  选择体裁标签 ...');
  } else {
      toastLog('未识别 选择体裁标签 按钮...');
  }
  sleep(300); // 暂停1秒
  widget = text("通用体裁").findOnce() 
  if (widget) {
      click(widget.bounds().centerX(), widget.bounds().centerY());
      toastLog('已点  通用体裁 ...');
      sleep(300);
        // 向上滑动
        var objTmp = text("vlog").findOnce();
        if (objTmp) {    
            var centerX = objTmp.bounds().centerX();// 获取控件的中心坐标
            var centerY = objTmp.bounds().centerY();    
            swipe(centerX, centerY, centerX, centerY - 1000, 500); // // 模拟向上滑动操作向上滑动1000像素，持续500毫秒
            toastLog("体裁标签：向上滑动操作完成");
        } else {
            toastLog("体裁标签：未找到包含'vlog'的控件,未能执行滑动操作***");
        }

  } else {
      toastLog('体裁标签：未识别 通用体裁 按钮...');
  }
  sleep(300);

  
  var ticaiList = ["vlog","种草分享", "产品展示", "知识科普", "教程攻略"];// 设置一个数组，保存三个不同的字符串
  var randomIndex = Math.floor(Math.random() * ticaiList.length);// 生成一个随机索引
  var ticaiStr = ticaiList[randomIndex];// 随机取出一个字符串
  widget = text(ticaiStr).findOnce() 
  if (widget) {
      click(widget.bounds().centerX(), widget.bounds().centerY());
      toastLog('已点   ...'+ticaiStr);
  } else {
      toastLog('体裁标签：未识别   按钮...'+ticaiStr);
  }

  sleep(300);
  widget = text("确认").findOnce() 
  if (widget) {
      click(widget.bounds().centerX(), widget.bounds().centerY());
      toastLog('已点  标签-确认 ...');
  } else {
      toastLog('未识别 标签-确认 按钮...');
  }

}



// 5. 关联商品 === 已提前在 京东app 上做了动作 已加好购物车 仅当前商品1个


// 5. 关联商品 === 已提前在 京东app 上做了动作 已加好购物车 仅当前商品1个
function setAddPro(skuID){
    var widget = text("关联商品").findOnce() 
    if (widget) {
        click(widget.bounds().centerX(), widget.bounds().centerY());
        toastLog('已点  关联商品 ...');
    } else {
        toastLog('未识别 关联商品 ...');
    }
    sleep(200);

    widget = text("请选择").findOnce() 
    if (widget) {
        click(widget.bounds().centerX(), widget.bounds().centerY());
        toastLog('已点  关联商品2请选择 ...');
    } else {
        toastLog('未识别 关联商品2请选择 ...');
    }


    sleep(2000);
    
    widget = text("支持商品链接与商品sku搜索").findOnce() 
    if (widget) {
        click(widget.bounds().centerX(), widget.bounds().centerY());
        // titleInput.click();// 点击输入框使其获得焦点        
        widget.setText(skuID);// 在输入框中输入SKUID
    } else {
        toastLog('未识别 商品sku搜索框 ...');
    }
    sleep(500);
    
    widget = text("搜索").findOnce() 
    if (widget) {
        click(widget.bounds().centerX(), widget.bounds().centerY());
        toastLog('已点 sku 搜索   ...');
    } else {
        toastLog('未识别 sku 搜索   ...');
    }
    sleep(2000); 

    //点选 商品列表中第一个 商品; 暂时按区域来处理
    press(150, 700, 500); // 模拟点击 位置x,y,时间， 屏幕放大也正常能按到， 目前分辨率是720*1280
    sleep(200);
    
    // press(170, 700, 500);

    widget = text("添加（1/10）").findOnce() 
    if (widget) {
        click(widget.bounds().centerX(), widget.bounds().centerY());
        toastLog('已点   添加（1/10） 购物车 ...');
    } else {
        toastLog('未识别  添加（1/10） 购物车, 再按一次商品 ...');
        press(160, 678, 500);//再按一次 商品
    }
    sleep(1000);  
    widget = text("添加（1/10）").findOnce() 
    if (widget) {
        click(widget.bounds().centerX(), widget.bounds().centerY());
        toastLog('已点   添加（1/10） 购物车 ...');
    } else {
        toastLog('未识别  添加（1/10） 购物车第2次 ...');        
        //退到初始界面 退2 点确定 退1 点确定
        toastLog('退到初始界面 backToHome  ...');
        backToHome()
    }

  }
  

// 退回到 主界面 homepage index 
function backToHome(){
    back();sleep(1000);//到封面标题关联选项界面
    toastLog('1.已退到  编辑界面-封面标题 ');
    back();sleep(2000);//到封面标题关联选项界面 back();sleep(1000); //到视频预览播放界面
    toastLog('2.准备退至  播放界面 ');

    btn = text("确认").findOnce() 
    if (btn) {
        btn.click()
        toastLog('已点 确认 取消编辑 ');
        toastLog('2.1.已退至  播放界面 ');
    }else{
        toastLog('2.2 已退至  播放界面 ？？？退到 编辑界面-封面标题 异常 ...'); 
        // back();sleep(1000);
    }
    back();sleep(2000);//到退出播放提示界面，需要点一下确定， 点后 到录制界面
    toastLog('3.已退到  录制界面 ');
    btn = text("确定").findOnce() 
    if (btn) {
        btn.click()
        toastLog('3.1已点 确定退出 录制界面 ');
    }else{
        toastLog('3.2？？？退到预览播放界面 异常 ...'); 
    }
    back();sleep(1000);
    toastLog('4.已退到  录制界面 ');
    back();sleep(1000);
    toastLog('5.再多退一步，兼容一下 ,到主界面 ');  
}






/**
 * 检查视频是否发布成功
 * @returns {Promise<boolean>} 返回一个Promise，resolve为true表示发布成功，false表示发布失败
 */
function checkVideoPublished() {
  return new Promise((resolve, reject) => {
      var maxWaitTime = 30000; // 最大等待时间，例如30秒
      var startTime = new Date().getTime();

      var checkInterval = setInterval(() => {
          // 检查是否超时
          if (new Date().getTime() - startTime > maxWaitTime) {
              toastLog("视频上传......超时");
              clearInterval(checkInterval);
              resolve(false);
          }

          // 检查视频是否发布成功
          if (text("内容已经发布成功，请前往查看").exists()) {
              toastLog("视频上传完成+......发布成功");
              clearInterval(checkInterval);
              resolve(true);
          }

          // 检查视频是否发布失败
          if (text("视频发布失败：上传失败，请稍后重试").exists()) {
              toastLog("视频上传完成+......发布失败");
              clearInterval(checkInterval);
              resolve(false);
          }
      }, 2000);
  });
}



/**
 * 处理文件名，提取SKU ID和标题
 * @param {string} srcFileName - 原始文件名
 * @return {Object} 包含skuID和title的对象
 */
function extractSkuAndTitle(srcFileName) {
  // 1. 去除后面的 .mp4 或 .mp5
  srcFileName = srcFileName.slice(0, -4); 
  // 2. 以第一个空格为分隔符分离字符串
    //   var parts = srcFileName.split(" ", 2);
    var parts = srcFileName.split(" ");
    var skuID = parts.shift(); // 获取第一部分 skuID号
    var title = parts.join(" "); // 获取剩余部分并重新合并 title标题
  // 获取skuID号和title标题
    //   var skuID = parts[0].trim(); // 去除前后的空格
    //   var title = parts[1] ? parts[1].trim() : ""; // 如果存在第二部分，则去除前后的空格
  // 返回包含skuID和title的对象
  return { skuID: skuID, title: title };
}


//进入基础准备工作界面的TAB标签面, 即 进入 创作->拍摄视频
function gotoBaseTab(){
  // 2.创作
    // press(450,2100, 500); 
    // toastLog('已点 创作 XY...');
    var widget = text("创作").findOnce() //.parent()
    if (widget) {
        click(widget.bounds().centerX(), widget.bounds().centerY());
        toastLog('已点 创作 ...');

    }else{
        toastLog('未识别 创作 widget对象...');
    }
    sleep(500); 
    // 3.点拍摄视频 // id("option_tv").className("android.widget.TextView").text("拍摄视频").findOnce().parent()
    widget = text("拍摄视频").findOnce() //.parent()
    if (widget) {
        click(widget.bounds().centerX(), widget.bounds().centerY());
        toastLog('已点入 拍摄视频 ...');

    }else{
        toastLog('未识别 拍摄视频 widget对象...');
    }
    sleep(1000); // 暂停1秒

    widget = text("当前视频发布失败，需继续发布吗").findOnce() //.parent()
    if (widget) {    
        toastLog('发现之前发布失败视频 要点 放弃 ...');
        var objTmp = text("放弃").findOnce() 
        if (objTmp) {
            click(objTmp.bounds().centerX(), objTmp.bounds().centerY());
            toastLog('已点 放弃 之前失败视频...');//点放弃后 会进到 相册界面
        } else {
            toastLog('未识别 放弃 按钮,但已发现 之前失败提示窗，后退一步...');
            back();sleep(200);//回到 创作TAB
        }
    }
}

//点入相册 选点视频 确定这个视频; 返回 点选视频确定视频结果  是否成功 真假; 
function chooseDestVideo(){
    var confirmVideoOK=false
  // 4. 点入 相册
  var widget = text("相册").findOnce() //.parent()
  if (widget) {
    click(widget.bounds().centerX(), widget.bounds().centerY());
    toastLog('已点入 相册 ...');
    sleep(1000); // 暂停1秒
    
    // 5.选中视频  相册中的视频 点选  ， 第一个视频 xy是 100,300
    var widget = text("没有找到符合条件的视频").findOnce()
    if (!widget) {
        press(100,500, 500); //第一个视频的XY
        toastLog('已点 视频 XY ..., 相册中的 第一个（唯一） 视频'); 
        sleep(2000);
        //1.确定这个视频
        var widget = text("确定").findOnce() 
        if (widget) {
            sleep(2000);
            click(widget.bounds().centerX(), widget.bounds().centerY());
            toastLog('已点  确定 ...');
            confirmVideoOK=true
        } else {
            toastLog('未识别 确定 按钮，右上角...');
            back();sleep(500);//3次返回 到 创作TAB页面
            back();sleep(500);
            back();sleep(500);
        }

    }else{
        toastLog('点入相册后, 没有找到符合条件的视频...');    
        back();sleep(500);  //返回 2次返回到 创作TAB
        back();sleep(500);      
    }

  }else{
    toastLog('未识别 相册 对象...');
    back();sleep(500);//返回到 创作TAB页
  }
  // sleep(1000);  
  return confirmVideoOK
}

//取文件夹中随机文件 
function getRandomVideoFile(videoDir){
  // 列出 所有文件
  var filesInVideoDir = files.listDir(videoDir);
  // 过滤出.MP5视频文件
  var videoFiles = filesInVideoDir.filter(function(name) {
      var filePath = videoDir + name;
      // 确保是文件而非文件夹
      if (files.isFile(filePath)) {
          // 这里以.mp4为例子，你可以根据需要添加 mp5 自定义视频格式
          return filePath.endsWith(".mp5");
      }
      return false;
  });

  var randomVideoFile="1.mp5"

  if (videoFiles.length > 0) {      
      var randomIndex = Math.floor(Math.random() * videoFiles.length);           
      randomVideoFile = videoFiles[randomIndex]; // 从videoFiles中随机取出一个文件 
      toastLog("随机选取的 视频库 文件: " + randomVideoFile);// 输出随机选取的视频文件路径
  } else {
      toastLog("没有找到 视频库 文件");
  }
  return randomVideoFile
}

//处理 移动 视频文件 ，改名 ， 传入 参数： 视频库中 随机一个当前视频文件名;  *** 返回是否成功
function processMoveFile(srcFileName,videoDir,destDir){   
    var moveFileOK=false
  var srcFile = videoDir + srcFileName; // 定义源文件路径  
  var destFileName=srcFileName.replace(".mp5", ".mp4");   
  var destFile = destDir + destFileName; // 定义 相册文件 路径+ 改名 // 构造目标文件的完整路径   
  if (files.exists(srcFile)) { 
      files.move(srcFile, destFile);// 移动文件
      toastLog("文件移动成功: " + destFile);
      moveFileOK=true
  } else {
      toastLog("源文件不存在: 特例处理 考虑跳出 返回等操作****** 未处理" + srcFile);
      //中断处理 跳出 返回
      
      exit();

  }
  sleep(1000); // 暂停1秒   
  // 使用media.scanFile函数扫描视频文件，将其加入到媒体库中 参数是完整路径 path
  media.scanFile(destFile);
  toastLog("已执行扫描文件： "+destFile)
  return moveFileOK
  
}
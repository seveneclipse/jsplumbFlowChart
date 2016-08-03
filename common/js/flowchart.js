var numberOfElements = 0;
var htmlBase = 'drawingArea';
var initpoint = {};
// var rubberbandDrawingActive = false;

var connectorPaintStyle = {
	lineWidth : 1,
	strokeStyle : "#096EBB",
	joinstyle : "round",
	outlineColor : "#096EBB",
	outlineWidth : 1
};

var connectorHoverStyle = {
	lineWidth : 2,
	strokeStyle : "#5C96BC",
	outlineWidth : 2,
	outlineColor : "white"
};

var endpointHoverStyle = {
	fillStyle : "#5C96BC"
};

var workflowConnectorStartpoint = {
		isSource : true,
		isTarget : false,
		anchor : "Bottom",
		maxConnections : -1,
		paintStyle : {
			strokeStyle : "#1e8151",
			fillStyle : "transparent",
			radius : 2,
			lineWidth : 2
		},

		connectorStyle : connectorPaintStyle,
		hoverPaintStyle : endpointHoverStyle,
		connectorHoverStyle : connectorHoverStyle,
		dragOptions : {},
		overlays : [ [ "Label", {
			location : [ 0.5, 1.5 ],
			label : "",
			cssClass : "endpointSourceLabel"
		} ] ]
	};

	var workflowConnectorEndpoint = {
		isSource : false,
		isTarget : true,
		maxConnections : -1,
		anchor : "Top",
		paintStyle : {
			fillStyle : 'red'
		},
		endpoint : [ "Rectangle", {
			width : 5,
			height : 5
		} ]
	};

jsPlumb.ready(function () {

	jsPlumb.draggable($(".window"),{ grid:[10,10] });

	jsPlumb.bind("dblclick", function(conn, originalEvent) {
		jsPlumb.detach(conn);
	});
    // 连接事件
    jsPlumb.bind("jsPlumbConnection", function(conn, originalEvent) {
      if (conn.connection.sourceId == conn.connection.targetId) {
        jsPlumb.detach(conn);
        alert("不能连接自己！");
        return false;
      }
      $.each(jsPlumb.getEndpoints(conn.source), function(i, el) {
        if (conn.connection != el.connections[0] &&
          (el.connections[0].targetId == conn.targetId || (el.connections[0].sourceId == conn.targetId && el.connections[0].targetId == conn.sourceId))) {
          jsPlumb.detach(conn);
          alert("不能重复连接！");
          return false;
        }
      });
    });
	
	jsPlumb.importDefaults({

		DragOptions : { cursor: 'pointer', zIndex:2000 },
		EndpointStyles : [{ fillStyle:'#225588' }, { fillStyle:'#558822' }],
		Endpoints : [ [ "Dot", { radius:2 } ], [ "Dot", { radius: 2 } ]],
		Connector:[ "Flowchart", { stub:[15, 25], gap:0, cornerRadius:5, alwaysRespectStubs:true } ],
		ConnectionOverlays : [
			[ "Arrow", { 
				location:1,
				id:"arrow",
				length:20,
				foldback:0.4
			} ],
			[ "Label", { 
				location:0.1,
				id:"label",
				cssClass:"aLabel"
			}]
		]
	});
	
	$('#'+htmlBase).on("mouseenter",'[data-nodetype="task"]', function () {
        $(this).append('<img src="common/images/close.png" data-nodetype="closeimg" style="position: absolute;" />');
        $("img").css("left", 108).css("top", -10);
    }).on("mouseleave", '[data-nodetype="task"]', function () {
        $("img").remove();
    }).on('click', '[data-nodetype="closeimg"]', function () {
		var $theNode = $(this).parent();
		
		jsPlumb.detachAllConnections($theNode);
		jsPlumb.removeAllEndpoints($theNode);
		
		$theNode.remove(); 
	});
	
	$('#'+htmlBase).on('dblclick', '[data-nodetype="task"]', function () {
		var text = $(this).text();
        $(this).html("");
        $(this).append('<input class="detail_text" type="text" value="' + text + '" />');
        $("input[type='text']").mouseleave(function () {
            $(this).parent().html("<div class='detail_text'>"+$("input[type='text']").val()+"</div>");
        });
	});
	
	$(".button_add_task").click(function () {
		addTask();
	});
					
	$(".button_add_decision").click(function () {
		addDecision();
	});
	
	$('#saveButton').click(function(){
		saveFlowchart();
	});
	
	$('#loadButton').click(function(){
		loadFlowchart();
	});
	loadFlowchart();
});
function addTask(id,posX,posY,condition){
	if(typeof id === "undefined"){
		numberOfElements++;
		id = "taskcontainer" + numberOfElements;
	}
	var _posX = 30;
	var _posY=30;
	if(posX){
		_posX = posX;
	}
	if(posY){
		_posY = posY;
	}
	
	$('<div class="window task node" id="' + id  +'" data-nodetype="task" style="left:'+_posX+'px; top:'+_posY+'px;">').appendTo('#'+htmlBase).html(
		'<div class="detail_text">请双击输入名称</div>');
						
	var taskSourceConnectorEndpoint = {
			endpoint:"Dot",
			paintStyle:{ 
				strokeStyle:"#1e8151",
				fillStyle:"transparent",
				radius: 2,
				lineWidth:2 
			},				
			isSource:true,
			maxConnections:-1,
			connector:[ "Flowchart", { stub:[15, 25], gap:0, cornerRadius:5, alwaysRespectStubs:true } ],								                
			connectorStyle: connectorPaintStyle,
			hoverPaintStyle: endpointHoverStyle,
			connectorHoverStyle: connectorHoverStyle,
	        dragOptions:{},
	        overlays:[
	        	[ "Label", { 
	            	location:[0.5, 0.5], 
	            	label:"",
	            	cssClass:"endpointSourceLabel" 
	            } ]
	        ]
	};

	var taskTargetConnectorEndpoint = {
			isTarget: true,
			anchor:[ 0.5, 0, 0, -1, 0, 0 , "task_end endpoint"],
			endpoint: "Dot",					
			paintStyle: { fillStyle:"#1e8151",radius: 2 },
			hoverPaintStyle: endpointHoverStyle,
			maxConnections:-1,
			dropOptions:{ hoverClass:"hover", activeClass:"active" },		
	    	overlays:[
	        	[ "Label", { location:[0.5,-6], label:condition, cssClass:"component" } ]
	    	]
	};
	
	jsPlumb.addEndpoint(
		$('#'+id),
		taskSourceConnectorEndpoint
	);
	
	jsPlumb.addEndpoint(
		$('#'+id),
		taskTargetConnectorEndpoint
	);
	
	jsPlumb.draggable($('#' + id),{ grid:[10,10] });
	return id;
}

function saveFlowchart(){
	var nodes = []
	$(".node").each(function (idx, elem) {
		var $elem = $(elem);
		if($elem.attr('id')!=='taskcontainer0'){
			var endpoints = jsPlumb.getEndpoints($elem.attr('id'));
			var nodeId = 0;
			if(!isNaN($elem.attr('id'))){
				nodeId = $elem.attr('id');
			}
			nodes.push({
				id: nodeId,
				tempId: $elem.attr('id'),
				nodetype: $elem.attr('data-nodetype'),
				nodename: $elem.find('.detail_text').first().html(),
				positionX: parseInt($elem.css("left"), 10),
				positionY: parseInt($elem.css("top"), 10)
			});
		}
	});
	var connections = [];
	$.each(jsPlumb.getConnections(), function (idx, connection) {
		connections.push({
			connectionId: connection.id,
			sourceId: connection.sourceId,
			targetId: connection.targetId
		});
	});
	
	var flowChart = {};
	flowChart.nodes = nodes;
	flowChart.connections = connections;
	flowChart.numberOfElements = numberOfElements;
	//TODO 界面需要有流程模版id
	flowChart.flowTemplateId = 379;
	//TODO 界面需提供租户id
	flowChart.tenantId = 1000;
	
	var flowChartJson = JSON.stringify(flowChart);
	
	
	$('#jsonOutput').val(flowChartJson);
}
function loadFlowchart(){
	var flowChartJson = $('#jsonOutput').val();
	var flowChart="";
	if(flowChartJson)
		var flowChart = JSON.parse(flowChartJson);

	var nodes = flowChart.nodes;
	if(nodes)
	$.each(nodes, function( index, elem ) {
		if(elem.nodetype === 'startpoint'){
			repositionElement('startpoint', elem.tempId, elem.positionX, elem.positionY);
		}else if(elem.nodetype === 'endpoint'){
			repositionElement('endpoint', elem.tempId, elem.positionX, elem.positionY);
		}else if(elem.nodetype === 'task'){
			var id = addTask(elem.tempId, elem.positionX, elem.positionY, elem.condition);
			repositionElement('task', id, elem.positionX, elem.positionY, elem.nodename);
		}
	});

	   initpoint.start = jsPlumb.addEndpoint(
			$('.startpoint'),
			workflowConnectorStartpoint
		);
		
		initpoint.end = jsPlumb.addEndpoint(
			$('[data-nodetype="endpoint"]'),
			workflowConnectorEndpoint
		);
	
	var connections = flowChart.connections;
	if(connections)
	$.each(connections, function( index, elem ) {
		 var connection1 = jsPlumb.connect({
			source: elem.sourceId,
			target: elem.targetId,
			overlays: [
	        	[ "Label", { 
	            	location:[0.5, 1.5], 
	            	label:"",
	            	cssClass:"endpointSourceLabel" 
	            } ]
	        ],
	        paintStyle:{ 
				strokeStyle:"#1e8151",
				fillStyle:"transparent",
				radius: 2,
				lineWidth:2 
			},
			anchors: ["Bottom", [0.5, 0, 0, -1]]
			
		});
	});
	jsPlumb.repaintEverything();
	numberOfElements = flowChart.numberOfElements===undefined ? 0 : flowChart.numberOfElements;
}
function repositionElement(type, id, posX, posY, nodename){
	if(type !=="task"){
		$('#'+type).attr('id',id);
	}
	if(nodename){
		$('#'+id).find('.detail_text').first().html(nodename);
	}else{
		$('#'+id).css('left', posX);
		$('#'+id).css('top', posY);
	}
	jsPlumb.repaint(id);
}


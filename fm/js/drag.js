

var Drag = {
    init : function(dragDiv,opacity){
        this.dragDiv =dragDiv;
        this.opacity =opacity|| 1;
        this.dragDiv.css('position','absolute');
        this.bind();
    },
    bind :function(){
        $this = this;
        this.dragDiv.on("mousedown",function(e){
            $this.dragDiv.css({
                opacity:$this.opacity,
                cursor:'move'
            });
            $this.dragging = true;
            $this.dragDiv.X = e.pageX - $this.dragDiv.offset().left;
            $this.dragDiv.Y = e.pageY - $this.dragDiv.offset().top;
        });

        this.dragDiv.on("mousemove",function(e){
            if($this.dragging){
                $this.dragDiv.css({
                    left : e.pageX-$this.dragDiv.X,
                    top : e.pageY-$this.dragDiv.Y
                });//控件新位置
            }
        });
        this.dragDiv.on("mouseup",function(e){
            $this.dragDiv.css({
                opacity:1,
                cursor:'default'
            });
            $this.dragging = false;
        });
    }
};

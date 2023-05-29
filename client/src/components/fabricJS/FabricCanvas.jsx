import React, { useCallback, useEffect, useRef } from "react";
import { fabric } from "fabric";
import {
    setCanvas,
    setCanvasElenment,
    setHight,
    setMaxHight,
    setMaxWidth,
    setWidth,
    setImageProportion
} from "../../store/reducers/ToolSlice";
import { useDispatch, useSelector } from "react-redux";
import addImage from "./addImage";
import useAddText from "./useAddText";
import { zoomDelta, enclose } from "../../services/utils/zoomDelta";
import drawLine from "./drawLine";
import addTrialngle from "./addTrialngle";
import addRectangle from "./addRectangle";
import addCircle from "./addCircle";
// import drawArrow from "./drawArrow";

function getMouse(options, canvas) {
    const pointer = canvas.getPointer(options.e);
    const posX = pointer.x;
    const posY = pointer.y;
    return { posX, posY };
}

const FabricCanvas = () => {
    const canvasRef = useRef(null);
    const addText = useAddText();
    const canvasWrapperRef = useRef(null);
    const dispatch = useDispatch();
    let active_obj = useRef([]);
    const { downTools, previewImg, curTool, canvas } = useSelector(
        (state) => state.toolReducer.states[state.toolReducer.curState]
    );

    const applyFilter = useCallback(() => {
        canvasRef.current.style.filter = `${downTools[2].filters[0].name}(${downTools[2].filters[0].value}%) 
            ${downTools[2].filters[1].name}(${downTools[2].filters[1].value}%) 
            ${downTools[2].filters[2].name}(${downTools[2].filters[2].value}%)
            ${downTools[2].filters[3].name}(${downTools[2].filters[3].value}%)
            ${downTools[2].filters[4].name}(${downTools[2].filters[4].value}px)
            ${downTools[2].filters[5].name}(${downTools[2].filters[5].value}%)
            ${downTools[2].filters[6].name}(${downTools[2].filters[6].value}%)
            ${downTools[2].filters[7].name}(${downTools[2].filters[7].value}deg)`;
        canvasRef.current.style.transform = `rotate(${downTools[4].value}deg)`;
    }, [canvasRef, downTools]);

    useEffect(() => {
        if (canvasRef.current !== null) {
            applyFilter();
        }
    }, [applyFilter]);

    useEffect(() => {
        const canvas = new fabric.Canvas(canvasRef.current, {
            allowTouchScrolling: true,
        });
        canvas.allowTouchScrolling = true;
        canvas.setHeight(Math.round(canvasWrapperRef.current?.clientHeight || 0));
        canvas.setWidth(Math.round(canvasWrapperRef.current?.clientWidth || 0));
        dispatch(
            setMaxHight({ height: canvasWrapperRef.current?.clientHeight })
        );
        dispatch(setMaxWidth({ width: canvasWrapperRef.current?.clientWidth }));
        dispatch(setCanvas({ canvas: canvas }));
        dispatch(setCanvasElenment({ canvas: canvasRef.current }));
        addImage(
            previewImg,
            canvas,
            canvasWrapperRef.current?.clientHeight,
            canvasWrapperRef.current?.clientWidth,
            dispatch,
            setHight,
            setWidth,
            setImageProportion,
            downTools[4].value
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (canvas) {
            canvas.__eventListeners = undefined;
            canvas.isDrawingMode = false;
        }
        if (curTool === "Text" && canvas) {
            canvas.on("selection:created", function (options) {
                active_obj.current = canvas.getActiveObjects();
            });
            canvas.on("mouse:up", function (options) {
                if (active_obj.current[0] || options.target != null) {
                    active_obj.current = canvas.getActiveObjects();
                    return;
                }
                const cords = getMouse(options, canvas);
                const obj = addText(canvas, cords);
                if (obj) {
                    canvas.setActiveObject(obj);
                }
                active_obj.current = canvas.getActiveObjects();
            })
        }
        else if (curTool === "Draw" && canvas && (downTools[3].curTool === "free")) {
            canvas.isDrawingMode = true;
            const color = `rgba(${downTools[3].curColor.rgb.r}, ${downTools[3].curColor.rgb.g}, ${downTools[3].curColor.rgb.b}, ${downTools[3].curColor.rgb.a})`
            canvas.freeDrawingBrush.color = color;
            canvas.freeDrawingBrush.width = downTools[3].size;
        }
        else if (curTool === "Draw" && canvas && (downTools[3].curTool === "straight")) {
            drawLine(canvas, downTools)
        }
        else if (curTool === "Draw" && canvas && (downTools[3].curTool === "triangle")) {
            canvas.on("selection:created", function (options) {
                active_obj.current = canvas.getActiveObjects();
            });
            canvas.on("mouse:down", function (options) {
                if (active_obj.current[0] || options.target != null) {
                    active_obj.current = canvas.getActiveObjects();
                    return;
                }
                const pointer = canvas.getPointer(options.e);
                const obj = addTrialngle(canvas, downTools, pointer);
                if (obj) {
                    canvas.setActiveObject(obj);
                }
                active_obj.current = canvas.getActiveObjects();
            })
        }
        else if (curTool === "Draw" && canvas && (downTools[3].curTool === "rectangle")) {
            canvas.on("selection:created", function (options) {
                active_obj.current = canvas.getActiveObjects();
            });
            canvas.on("mouse:down", function (options) {
                if (active_obj.current[0] || options.target != null) {
                    active_obj.current = canvas.getActiveObjects();
                    return;
                }
                const pointer = canvas.getPointer(options.e);
                const obj = addRectangle(canvas, downTools, pointer);
                if (obj) {
                    canvas.setActiveObject(obj);
                }
                active_obj.current = canvas.getActiveObjects();
            })
        }
        else if (curTool === "Draw" && canvas && (downTools[3].curTool === "circle")) {
            canvas.on("selection:created", function (options) {
                active_obj.current = canvas.getActiveObjects();
            });
            canvas.on("mouse:down", function (options) {
                if (active_obj.current[0] || options.target != null) {
                    active_obj.current = canvas.getActiveObjects();
                    return;
                }
                const pointer = canvas.getPointer(options.e);
                const obj = addCircle(canvas, downTools, pointer);
                if (obj) {
                    canvas.setActiveObject(obj);
                }
                active_obj.current = canvas.getActiveObjects();
            })
        }
        else {
            if (canvas) {
                canvas.isDrawingMode = false;
                canvas.__eventListeners = undefined;
            }
        }
        if (canvas) {
            canvas.on("mouse:wheel", function (opt) {
                zoomDelta(canvas, opt.e.deltaY, opt.e.offsetX, opt.e.offsetY);
                enclose(canvas, {
                    br: { x: downTools[6].width, y: downTools[6].height },
                    tl: { x: 0, y: 0 },
                });
                opt.e.preventDefault();
                opt.e.stopPropagation();
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [curTool, downTools]);

    return (
        <div
            className="canvas-wrapper w-full h-full flex justify-center"
            ref={canvasWrapperRef}
        >
            <canvas
                className="border border-white "
                ref={canvasRef}
                onLoad={applyFilter}
            />
        </div>
    );
};

export default FabricCanvas;

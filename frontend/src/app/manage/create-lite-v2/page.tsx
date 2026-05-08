"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import {
  ArrowLeft,
  Copy,
  Download,
  Eraser,
  Image as ImageIcon,
  Layers,
  PaintBucket,
  Redo2,
  Trash2,
  Type,
  Undo2,
  Upload,
} from "lucide-react";

type FabricModule = typeof import("fabric");
type FabricCanvas = import("fabric").Canvas;
type FabricObject = import("fabric").FabricObject;
type MobilePanel = "quick" | "text" | "background" | "layers";

const PRESET_COLORS = [
  "rgba(0,0,0,0)",
  "#FFFFFF",
  "#EEF0FF",
  "#F8FAFC",
  "#FFF7ED",
  "#FCE7F3",
  "#ECFEFF",
  "#0F172A",
  "#111827",
];

const FONT_OPTIONS = [
  { label: "Arial", value: "Arial" },
  { label: "Tahoma", value: "Tahoma" },
  { label: "Verdana", value: "Verdana" },
  { label: "Georgia", value: "Georgia" },
  { label: "Courier New", value: "Courier New" },
];

const averageColor = (pixels: number[][]) => {
  const totals = pixels.reduce(
    (acc, pixel) => {
      acc[0] += pixel[0];
      acc[1] += pixel[1];
      acc[2] += pixel[2];
      return acc;
    },
    [0, 0, 0]
  );

  return totals.map((value) => Math.round(value / pixels.length)) as [number, number, number];
};

const colorDistance = (
  source: [number, number, number],
  target: [number, number, number]
) => {
  const dr = source[0] - target[0];
  const dg = source[1] - target[1];
  const db = source[2] - target[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
};

async function removeBackgroundSmart(dataUrl: string) {
  const imgly = await import("@imgly/background-removal");
  const blob = await imgly.removeBackground(dataUrl, {
    debug: false,
    device: "cpu",
    model: "isnet_fp16",
    output: {
      format: "image/png",
      quality: 1,
    },
  });

  return URL.createObjectURL(blob);
}

export default function CreateLiteV2Page() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
  const canvasViewportRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fabricModuleRef = useRef<FabricModule | null>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const undoStackRef = useRef<string[]>([]);
  const redoStackRef = useRef<string[]>([]);
  const isRestoringHistoryRef = useRef(false);
  const lastSnapshotRef = useRef("");

  const [isReady, setIsReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState("กำลังเตรียมเครื่องมือ...");
  const [backgroundColor, setBackgroundColor] = useState("#EEF0FF");
  const [textValue, setTextValue] = useState("ข้อความใหม่");
  const [textColor, setTextColor] = useState("#0F172A");
  const [textBackgroundColor, setTextBackgroundColor] = useState("#FFFFFF");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(72);
  const [fontWeight, setFontWeight] = useState(800);
  const [fontStyle, setFontStyle] = useState<"normal" | "italic">("normal");
  const [isUnderline, setIsUnderline] = useState(false);
  const [selectedType, setSelectedType] = useState<"none" | "image" | "text" | "shape">("none");
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const [activeMobilePanel, setActiveMobilePanel] = useState<MobilePanel>("quick");
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [currentPlanLabel, setCurrentPlanLabel] = useState("แผนพื้นฐาน");

  const updateHistoryButtons = () => {
    setCanUndo(undoStackRef.current.length > 1);
    setCanRedo(redoStackRef.current.length > 0);
  };

  const captureCanvasSnapshot = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return "";

    return JSON.stringify({
      backgroundColor: canvas.backgroundColor ?? "#EEF0FF",
      objects: canvas.toJSON().objects,
    });
  };

  const pushHistorySnapshot = () => {
    if (isRestoringHistoryRef.current) return;

    const snapshot = captureCanvasSnapshot();
    if (!snapshot || snapshot === lastSnapshotRef.current) return;

    undoStackRef.current.push(snapshot);
    lastSnapshotRef.current = snapshot;
    redoStackRef.current = [];
    updateHistoryButtons();
  };

  const restoreHistorySnapshot = async (snapshot: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const parsed = JSON.parse(snapshot) as {
      backgroundColor?: string;
      objects?: unknown[];
    };

    isRestoringHistoryRef.current = true;

    await new Promise<void>((resolve) => {
      canvas.loadFromJSON(
        {
          objects: parsed.objects ?? [],
          version: canvas.toJSON().version,
        },
        () => {
          canvas.backgroundColor = parsed.backgroundColor ?? "#EEF0FF";
          canvas.discardActiveObject();
          canvas.renderAll();
          canvas.calcOffset();
          resolve();
        }
      );
    });

    setBackgroundColor(parsed.backgroundColor ?? "#EEF0FF");
    setSelectedType("none");
    lastSnapshotRef.current = snapshot;
    isRestoringHistoryRef.current = false;
    updateHistoryButtons();
  };

  const undoAction = async () => {
    if (undoStackRef.current.length <= 1) {
      setStatusMessage("ไม่มีรายการให้ย้อนกลับแล้ว");
      return;
    }

    const current = undoStackRef.current.pop();
    if (current) {
      redoStackRef.current.push(current);
    }

    const previous = undoStackRef.current[undoStackRef.current.length - 1];
    if (!previous) {
      updateHistoryButtons();
      return;
    }

    await restoreHistorySnapshot(previous);
    setStatusMessage("ย้อนกลับให้แล้ว");
  };

  const redoAction = async () => {
    const next = redoStackRef.current.pop();
    if (!next) {
      setStatusMessage("ไม่มีรายการให้ไปข้างหน้าแล้ว");
      return;
    }

    undoStackRef.current.push(next);
    await restoreHistorySnapshot(next);
    setStatusMessage("ไปข้างหน้าให้แล้ว");
  };

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) return;

    const loadCurrentUser = async () => {
      try {
        const response = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;

        const data = await response.json();
        setCurrentPlanLabel(data?.subscription_tier === "premium" ? "แผนพรีเมียม" : "แผนพื้นฐาน");
      } catch (error) {
        console.error("โหลดข้อมูลแผนไม่สำเร็จ", error);
      }
    };

    void loadCurrentUser();
  }, [API_URL]);

  useEffect(() => {
    let mounted = true;
    let resizeObserver: ResizeObserver | null = null;

    const initializeCanvas = async () => {
      if (!canvasElementRef.current) return;

      const fabric = await import("fabric");
      if (!mounted || !canvasElementRef.current) return;

      fabricModuleRef.current = fabric;

      const canvas = new fabric.Canvas(canvasElementRef.current, {
        width: 1080,
        height: 1080,
        preserveObjectStacking: true,
        selection: true,
      });
      canvas.backgroundColor = backgroundColor;
      canvas.renderAll();
      fabricCanvasRef.current = canvas;

      const applyResponsiveCanvasSize = () => {
        const viewport = canvasViewportRef.current;
        if (!viewport) return;

        const size = Math.max(280, Math.floor(viewport.clientWidth));
        canvas.setDimensions({ width: `${size}px`, height: `${size}px` }, { cssOnly: true });
        canvas.renderAll();
        canvas.calcOffset();
      };

      applyResponsiveCanvasSize();

      resizeObserver = new ResizeObserver(() => {
        applyResponsiveCanvasSize();
      });

      if (canvasViewportRef.current && resizeObserver) {
        resizeObserver.observe(canvasViewportRef.current);
      }

      const syncSelectedState = () => {
        const active = canvas.getActiveObject() as (FabricObject & {
          type?: string;
          text?: string;
          fill?: string;
          backgroundColor?: string;
          fontFamily?: string;
          fontSize?: number;
          fontWeight?: string | number;
          fontStyle?: string;
          underline?: boolean;
        }) | null;

        if (!active) {
          setSelectedType("none");
          return;
        }

        if (active.type === "textbox" || active.type === "i-text") {
          setSelectedType("text");
          setTextValue(active.text ?? "ข้อความใหม่");
          setTextColor(typeof active.fill === "string" ? active.fill : "#0F172A");
          setTextBackgroundColor(
            typeof active.backgroundColor === "string" && active.backgroundColor
              ? active.backgroundColor
              : "#FFFFFF"
          );
          setFontFamily(active.fontFamily ?? "Arial");
          setFontSize(typeof active.fontSize === "number" ? Math.round(active.fontSize) : 72);
          setFontWeight(Number(active.fontWeight ?? 800));
          setFontStyle(active.fontStyle === "italic" ? "italic" : "normal");
          setIsUnderline(Boolean(active.underline));
          return;
        }

        if (active.type === "image") {
          setSelectedType("image");
          return;
        }

        setSelectedType("shape");
      };

      canvas.on("selection:created", syncSelectedState);
      canvas.on("selection:updated", syncSelectedState);
      canvas.on("selection:cleared", syncSelectedState);
      canvas.on("object:modified", syncSelectedState);
      canvas.on("object:added", pushHistorySnapshot);
      canvas.on("object:removed", pushHistorySnapshot);
      canvas.on("object:modified", pushHistorySnapshot);
      canvas.on("text:changed", pushHistorySnapshot);

      lastSnapshotRef.current = "";
      pushHistorySnapshot();

      setIsReady(true);
      setStatusMessage("พร้อมใช้งานแล้ว");
    };

    initializeCanvas().catch((error) => {
      console.error(error);
      setStatusMessage("โหลดเครื่องมือไม่สำเร็จ");
    });

    return () => {
      resizeObserver?.disconnect();
      mounted = false;
      fabricCanvasRef.current?.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    fabricCanvasRef.current.backgroundColor = backgroundColor;
    fabricCanvasRef.current.renderAll();
    if (isReady) {
      pushHistorySnapshot();
    }
  }, [backgroundColor, isReady]);

  const updateActiveTextbox = (updates: {
    text?: string;
    fill?: string;
    backgroundColor?: string;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
    fontStyle?: "normal" | "italic";
    underline?: boolean;
  }) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const active = canvas.getActiveObject() as (FabricObject & {
      type?: string;
      set: (properties: Record<string, string | number>) => void;
    }) | null;

    if (!active || (active.type !== "textbox" && active.type !== "i-text")) return;

    active.set(updates);
    canvas.renderAll();
  };

  const addText = async () => {
    const canvas = fabricCanvasRef.current;
    const fabric = fabricModuleRef.current;
    if (!canvas || !fabric) return;

    const textbox = new fabric.Textbox(textValue || "ข้อความใหม่", {
      left: 540,
      top: 540,
      originX: "center",
      originY: "center",
      width: 760,
      fontSize: Math.max(fontSize, 96),
      fontWeight,
      fontStyle,
      underline: isUnderline,
      fill: textColor,
      backgroundColor: textBackgroundColor,
      fontFamily,
      editable: true,
      textAlign: "center",
      splitByGrapheme: false,
      padding: 16,
    });

    canvas.add(textbox);
    canvas.bringObjectToFront(textbox);
    canvas.setActiveObject(textbox);
    canvas.requestRenderAll();
    requestAnimationFrame(() => {
      canvas.setActiveObject(textbox);
      textbox.enterEditing();
      textbox.selectAll();
      canvas.requestRenderAll();
    });
    setSelectedType("text");
    setStatusMessage("เพิ่มข้อความแล้ว พิมพ์แก้ไขได้ทันที");
  };

  const fitImageToCanvas = (image: FabricObject & {
    width?: number;
    height?: number;
    scale: (value: number) => void;
    set: (properties: Record<string, number>) => void;
  }) => {
    const maxWidth = 760;
    const maxHeight = 760;
    const width = image.width ?? 1;
    const height = image.height ?? 1;
    const scale = Math.min(maxWidth / width, maxHeight / height, 1.6);

    image.scale(scale);
    image.set({
      left: 540,
      top: 420,
    });
    image.set("originX", "center");
    image.set("originY", "center");
  };

  const addImageFromDataUrl = async (dataUrl: string) => {
    const canvas = fabricCanvasRef.current;
    const fabric = fabricModuleRef.current;
    if (!canvas || !fabric) return;

    const image = await fabric.FabricImage.fromURL(dataUrl);
    fitImageToCanvas(image as never);
    canvas.add(image);
    canvas.setActiveObject(image);
    canvas.renderAll();
    setSelectedType("image");
    setStatusMessage("เพิ่มรูปลงงานแล้ว");
  };

  const handleUploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          await addImageFromDataUrl(reader.result as string);
        } catch (error) {
          console.error(error);
          setStatusMessage("อัปโหลดรูปไม่สำเร็จ");
        }
      };
      reader.readAsDataURL(file);
      event.target.value = "";
    } catch (error) {
      console.error(error);
      setStatusMessage("อัปโหลดรูปไม่สำเร็จ");
    }
  };

  const removeSelectedBackground = async () => {
    const canvas = fabricCanvasRef.current;
    const fabric = fabricModuleRef.current;
    if (!canvas || !fabric) return;

    const active = canvas.getActiveObject() as (FabricObject & {
      type?: string;
      toDataURL?: (options?: Record<string, unknown>) => string;
      left?: number;
      top?: number;
      angle?: number;
      scaleX?: number;
      scaleY?: number;
      opacity?: number;
      originX?: string;
      originY?: string;
    }) | null;

    if (!active || active.type !== "image" || !active.toDataURL) {
      setStatusMessage("เลือกภาพก่อนลบพื้นหลัง");
      return;
    }

    try {
      setIsRemovingBackground(true);
      setStatusMessage("กำลังลบพื้นหลัง อาจใช้เวลาสักครู่ในครั้งแรก...");
      const originalDataUrl = active.toDataURL({ format: "png" });
      const processed = await removeBackgroundSmart(originalDataUrl);
      const replacement = await fabric.FabricImage.fromURL(processed);

      replacement.set({
        left: active.left,
        top: active.top,
        angle: active.angle,
        scaleX: active.scaleX,
        scaleY: active.scaleY,
        opacity: active.opacity,
        originX: active.originX,
        originY: active.originY,
      });

      canvas.remove(active);
      canvas.add(replacement);
      canvas.setActiveObject(replacement);
      canvas.renderAll();
      setSelectedType("image");
      setStatusMessage("ลบพื้นหลังให้แล้ว");
    } catch (error) {
      console.error(error);
      setStatusMessage("ลบพื้นหลังไม่สำเร็จบนอุปกรณ์นี้ ลองใหม่อีกครั้งหรือใช้รูปที่คมชัดขึ้น");
    } finally {
      setIsRemovingBackground(false);
    }
  };

  const deleteSelectedObject = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const active = canvas.getActiveObject();
    if (!active) {
      setStatusMessage("ยังไม่ได้เลือกวัตถุ");
      return;
    }

    canvas.remove(active);
    canvas.discardActiveObject();
    canvas.renderAll();
    setSelectedType("none");
    setStatusMessage("ลบวัตถุที่เลือกแล้ว");
  };

  const duplicateSelectedObject = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const active = canvas.getActiveObject() as (FabricObject & {
      clone: (callback: (cloned: FabricObject) => void) => void;
    }) | null;

    if (!active) {
      setStatusMessage("ยังไม่ได้เลือกวัตถุ");
      return;
    }

    active.clone((cloned) => {
      cloned.set({
        left: (cloned.left ?? 0) + 36,
        top: (cloned.top ?? 0) + 36,
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
      setStatusMessage("ทำสำเนาให้แล้ว");
    });
  };

  const moveLayer = (direction: "forward" | "backward") => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const active = canvas.getActiveObject();
    if (!active) {
      setStatusMessage("ยังไม่ได้เลือกวัตถุ");
      return;
    }

    if (direction === "forward") {
      canvas.bringObjectForward(active);
    } else {
      canvas.sendObjectBackwards(active);
    }

    canvas.renderAll();
    setStatusMessage(direction === "forward" ? "เลื่อนชั้นขึ้นแล้ว" : "เลื่อนชั้นลงแล้ว");
  };

  const exportCanvas = (format: "png" | "jpeg") => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const originalBackgroundColor = canvas.backgroundColor;
    const shouldUseTransparentBackground = format === "png";

    if (shouldUseTransparentBackground) {
      canvas.backgroundColor = "rgba(0,0,0,0)";
      canvas.renderAll();
    }

    const dataUrl = canvas.toDataURL({
      format,
      quality: format === "jpeg" ? 0.96 : 1,
      multiplier: 2,
    });

    if (shouldUseTransparentBackground) {
      canvas.backgroundColor = originalBackgroundColor;
      canvas.renderAll();
    }

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `nex-editor-${Date.now()}.${format === "jpeg" ? "jpg" : "png"}`;
    link.click();
    setStatusMessage(
      format === "png"
        ? "ส่งออก PNG พื้นหลังใสเรียบร้อยแล้ว"
        : `ส่งออก ${format.toUpperCase()} เรียบร้อยแล้ว`
    );
  };

  const clearCanvas = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.getObjects().forEach((object) => {
      canvas.remove(object);
    });

    canvas.discardActiveObject();
    canvas.renderAll();
    setSelectedType("none");
    setStatusMessage("ล้างงานทั้งหมดแล้ว");
  };

  const quickActions = (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center justify-center gap-2 rounded-2xl bg-[#FF6B00] px-4 py-3 text-sm font-black text-white shadow-[0_18px_40px_-24px_rgba(255,107,0,0.6)] transition hover:-translate-y-0.5"
      >
        <Upload size={16} />
        อัปโหลดรูป
      </button>
      <button
        type="button"
        onClick={addText}
        className="flex items-center justify-center gap-2 rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] px-4 py-3 text-sm font-black text-[#050579]"
      >
        <Type size={16} />
        เพิ่มข้อความ
      </button>
      <button
        type="button"
        onClick={removeSelectedBackground}
        disabled={selectedType !== "image" || isRemovingBackground}
        className="flex items-center justify-center gap-2 rounded-2xl border border-[#D9E1F2] bg-white px-4 py-3 text-sm font-black text-[#475569] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Eraser size={16} />
        {isRemovingBackground ? "กำลังลบ..." : "ลบพื้นหลัง"}
      </button>
      <button
        type="button"
        onClick={deleteSelectedObject}
        disabled={selectedType === "none"}
        className="flex items-center justify-center gap-2 rounded-2xl border border-[#F3C5C1] bg-[#FFF5F4] px-4 py-3 text-sm font-black text-[#D64545] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Trash2 size={16} />
        ลบวัตถุ
      </button>
      <button
        type="button"
        onClick={undoAction}
        disabled={!canUndo}
        className="flex items-center justify-center gap-2 rounded-2xl border border-[#D9E1F2] bg-white px-4 py-3 text-sm font-black text-[#475569] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Undo2 size={16} />
        ย้อนกลับ
      </button>
      <button
        type="button"
        onClick={redoAction}
        disabled={!canRedo}
        className="flex items-center justify-center gap-2 rounded-2xl border border-[#D9E1F2] bg-white px-4 py-3 text-sm font-black text-[#475569] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Redo2 size={16} />
        ไปข้างหน้า
      </button>
    </div>
  );

  const backgroundControls = (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#64748B]">
        <PaintBucket size={14} />
        สีพื้นหลัง
      </label>
      <div className="grid grid-cols-4 gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => setBackgroundColor(color)}
            className={`h-12 rounded-2xl border transition ${
              backgroundColor === color ? "border-[#050579] ring-2 ring-[#050579]/20" : "border-[#D9E1F2]"
            }`}
            style={color === "rgba(0,0,0,0)" ? {
              backgroundImage:
                "linear-gradient(45deg,#E2E8F0 25%,transparent 25%,transparent 75%,#E2E8F0 75%,#E2E8F0),linear-gradient(45deg,#E2E8F0 25%,transparent 25%,transparent 75%,#E2E8F0 75%,#E2E8F0)",
              backgroundPosition: "0 0, 8px 8px",
              backgroundSize: "16px 16px",
              backgroundColor: "#FFFFFF",
            } : { backgroundColor: color }}
            title={color === "rgba(0,0,0,0)" ? "พื้นหลังใส" : color}
          >
            {color === "rgba(0,0,0,0)" ? (
              <span className="text-[10px] font-black text-[#475569]">ใส</span>
            ) : null}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setBackgroundColor("rgba(0,0,0,0)")}
        className="w-full rounded-2xl border border-[#D9E1F2] bg-white px-4 py-3 text-sm font-black text-[#475569]"
      >
        ลบพื้นหลังงานให้ใส
      </button>
      <input
        type="color"
        value={backgroundColor === "rgba(0,0,0,0)" ? "#FFFFFF" : backgroundColor}
        onChange={(event) => setBackgroundColor(event.target.value)}
        className="h-11 w-full cursor-pointer rounded-2xl border border-[#D9E1F2] bg-white p-1"
      />
    </div>
  );

  const textControls = (
    <div className="space-y-3 rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-black text-[#050579]">ข้อความที่เลือก</div>
        <div className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-[#64748B]">
          {selectedType === "text" ? "เลือกข้อความแล้ว" : "เลือกกล่องข้อความก่อน"}
        </div>
      </div>
      <textarea
        value={textValue}
        onChange={(event) => {
          const value = event.target.value;
          setTextValue(value);
          updateActiveTextbox({ text: value });
        }}
        rows={3}
        className="w-full rounded-2xl border border-[#D9E1F2] bg-white px-4 py-3 text-sm text-[#0F172A] outline-none"
        placeholder="เลือกกล่องข้อความก่อน แล้วพิมพ์แก้ได้ทันที"
      />

      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-2 text-xs font-black uppercase tracking-[0.12em] text-[#64748B]">
          <span>สีข้อความ</span>
          <input
            type="color"
            value={textColor}
            onChange={(event) => {
              const value = event.target.value;
              setTextColor(value);
              updateActiveTextbox({ fill: value });
            }}
            className="h-11 w-full cursor-pointer rounded-2xl border border-[#D9E1F2] bg-white p-1"
          />
        </label>

        <label className="space-y-2 text-xs font-black uppercase tracking-[0.12em] text-[#64748B]">
          <span>พื้นหลังข้อความ</span>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input
              type="color"
              value={textBackgroundColor}
              onChange={(event) => {
                const value = event.target.value;
                setTextBackgroundColor(value);
                updateActiveTextbox({ backgroundColor: value });
              }}
              className="h-11 w-full cursor-pointer rounded-2xl border border-[#D9E1F2] bg-white p-1"
            />
            <button
              type="button"
              onClick={() => {
                setTextBackgroundColor("#FFFFFF");
                updateActiveTextbox({ backgroundColor: "transparent" });
              }}
              className="h-11 rounded-2xl border border-[#D9E1F2] bg-white px-3 text-[11px] font-black text-[#475569]"
            >
              ใส
            </button>
          </div>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-2 text-xs font-black uppercase tracking-[0.12em] text-[#64748B]">
          <span>ฟอนต์</span>
          <select
            value={fontFamily}
            onChange={(event) => {
              const value = event.target.value;
              setFontFamily(value);
              updateActiveTextbox({ fontFamily: value });
            }}
            className="h-11 w-full rounded-2xl border border-[#D9E1F2] bg-white px-4 text-sm font-bold text-[#0F172A] outline-none"
          >
            {FONT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-xs font-black uppercase tracking-[0.12em] text-[#64748B]">
          <span>น้ำหนักตัวอักษร</span>
          <input
            type="range"
            min="300"
            max="900"
            step="100"
            value={fontWeight}
            onChange={(event) => {
              const value = Number(event.target.value);
              setFontWeight(value);
              updateActiveTextbox({ fontWeight: value });
            }}
            className="w-full accent-[#050579]"
          />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => {
            const nextWeight = fontWeight >= 700 ? 400 : 800;
            setFontWeight(nextWeight);
            updateActiveTextbox({ fontWeight: nextWeight });
          }}
          className={`rounded-2xl border px-3 py-3 text-sm font-black transition ${
            fontWeight >= 700
              ? "border-[#050579] bg-[#050579] text-white"
              : "border-[#D9E1F2] bg-white text-[#475569]"
          }`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => {
            const nextStyle = fontStyle === "italic" ? "normal" : "italic";
            setFontStyle(nextStyle);
            updateActiveTextbox({ fontStyle: nextStyle });
          }}
          className={`rounded-2xl border px-3 py-3 text-sm font-black transition ${
            fontStyle === "italic"
              ? "border-[#050579] bg-[#050579] text-white"
              : "border-[#D9E1F2] bg-white text-[#475569]"
          }`}
        >
          <span className="italic">I</span>
        </button>
        <button
          type="button"
          onClick={() => {
            const nextUnderline = !isUnderline;
            setIsUnderline(nextUnderline);
            updateActiveTextbox({ underline: nextUnderline });
          }}
          className={`rounded-2xl border px-3 py-3 text-sm font-black transition ${
            isUnderline
              ? "border-[#050579] bg-[#050579] text-white"
              : "border-[#D9E1F2] bg-white text-[#475569]"
          }`}
        >
          <span className="underline">U</span>
        </button>
      </div>

      <label className="space-y-2 text-xs font-black uppercase tracking-[0.12em] text-[#64748B]">
        <span>ขนาดตัวอักษร {fontSize}px</span>
        <input
          type="range"
          min="24"
          max="180"
          value={fontSize}
          onChange={(event) => {
            const value = Number(event.target.value);
            setFontSize(value);
            updateActiveTextbox({ fontSize: value });
          }}
          className="w-full accent-[#050579]"
        />
      </label>
    </div>
  );

  const layerControls = (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={duplicateSelectedObject}
        disabled={selectedType === "none"}
        className="flex items-center justify-center gap-2 rounded-2xl border border-[#D9E1F2] bg-white px-4 py-3 text-sm font-black text-[#475569] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Copy size={16} />
        ทำสำเนา
      </button>
      <button
        type="button"
        onClick={() => moveLayer("forward")}
        disabled={selectedType === "none"}
        className="flex items-center justify-center gap-2 rounded-2xl border border-[#D9E1F2] bg-white px-4 py-3 text-sm font-black text-[#475569] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Layers size={16} />
        เลื่อนชั้นขึ้น
      </button>
      <button
        type="button"
        onClick={() => moveLayer("backward")}
        disabled={selectedType === "none"}
        className="flex items-center justify-center gap-2 rounded-2xl border border-[#D9E1F2] bg-white px-4 py-3 text-sm font-black text-[#475569] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Layers size={16} />
        เลื่อนชั้นลง
      </button>
      <button
        type="button"
        onClick={clearCanvas}
        className="flex items-center justify-center gap-2 rounded-2xl border border-[#D9E1F2] bg-white px-4 py-3 text-sm font-black text-[#475569]"
      >
        <Trash2 size={16} />
        ล้างงาน
      </button>
    </div>
  );

  const exportControls = (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => exportCanvas("png")}
        className="flex items-center justify-center gap-2 rounded-2xl bg-[#FF6B00] px-4 py-3 text-sm font-black text-white shadow-[0_18px_40px_-24px_rgba(255,107,0,0.6)]"
      >
        <Download size={16} />
        Export PNG ใส
      </button>
      <button
        type="button"
        onClick={() => exportCanvas("jpeg")}
        className="flex items-center justify-center gap-2 rounded-2xl border border-[#D9E1F2] bg-white px-4 py-3 text-sm font-black text-[#050579]"
      >
        <ImageIcon size={16} />
        Export JPG
      </button>
    </div>
  );

  const renderMobilePanel = () => {
    if (activeMobilePanel === "text") return textControls;
    if (activeMobilePanel === "background") return backgroundControls;
    if (activeMobilePanel === "layers") return <div className="space-y-4">{layerControls}{exportControls}</div>;
    return <div className="space-y-4">{quickActions}{exportControls}</div>;
  };

  return (
    <div className="min-h-screen bg-[#EEF0FF] text-[#0F172A]">
      <nav className="sticky top-0 z-40 border-b border-[#D9E1F2] bg-white/90 backdrop-blur-md">
        <div className="relative mx-auto flex h-24 w-full max-w-md items-center px-4 md:max-w-6xl">
          <Link
            href="/manage/create-lite"
            className="absolute left-6 flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-[#F6F8FF] group"
            title="ย้อนกลับ"
          >
            <ArrowLeft size={20} className="text-[#64748B] transition-all group-hover:text-[#050579]" />
          </Link>

          <div className="mx-auto flex min-w-0 flex-col items-center text-center">
            <div className="mb-0.5 text-[11px] font-black uppercase leading-none tracking-[0.18em] text-[#94A3B8]">
              Edit Picture
            </div>
            <div className="text-base font-black text-[#050579]">แก้ไขภาพ ข้อความ และเลเยอร์</div>
            <div className="mt-2 inline-flex items-center rounded-full border border-[#D9E1F2] bg-[#F6F8FF] px-3 py-1 text-xs font-bold text-[#64748B]">
              <span className="mr-1.5 text-[#94A3B8]">แผนปัจจุบัน</span>
              <span className="text-[#050579]">{currentPlanLabel}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <section className="hidden rounded-3xl border border-[#D9E1F2] bg-white p-5 shadow-[0_18px_40px_-30px_rgba(5,5,121,0.16)] lg:block">
          <div className="mb-5 flex items-center gap-2">
            <Layers size={18} className="text-[#050579]" />
            <h2 className="text-lg font-black text-[#050579]">เครื่องมือแก้ไข</h2>
          </div>

          <div className="space-y-5">
            {quickActions}

            {backgroundControls}
            {textControls}
            {layerControls}
            {exportControls}
          </div>
        </section>

        <section className="rounded-[2rem] border border-[#D9E1F2] bg-white p-4 shadow-[0_24px_48px_-34px_rgba(5,5,121,0.2)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] px-4 py-3">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.12em] text-[#94A3B8]">Canvas Status</div>
              <div className="text-sm font-bold text-[#334155]">{statusMessage}</div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={undoAction}
                disabled={!canUndo}
                className="inline-flex items-center gap-2 rounded-full border border-[#D9E1F2] bg-white px-3 py-2 text-xs font-black text-[#050579] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Undo2 size={14} />
                ย้อนกลับ
              </button>
              <button
                type="button"
                onClick={redoAction}
                disabled={!canRedo}
                className="inline-flex items-center gap-2 rounded-full border border-[#D9E1F2] bg-white px-3 py-2 text-xs font-black text-[#050579] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Redo2 size={14} />
                ไปข้างหน้า
              </button>
              <div className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#050579]">
                {selectedType === "none" ? "ยังไม่ได้เลือกวัตถุ" : `กำลังเลือก ${selectedType}`}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-[#D9E1F2] bg-[#F4F7FF] p-3">
            <div
              ref={canvasViewportRef}
              className="mx-auto aspect-square w-full max-w-[720px] overflow-hidden rounded-[1.5rem] bg-white shadow-[0_26px_60px_-40px_rgba(15,23,42,0.35)]"
            >
              <canvas ref={canvasElementRef} className="h-full w-full" />
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[#D9E1F2] bg-[#FFF7ED] px-4 py-3 text-sm text-[#9A3412]">
            ลากวัตถุบนภาพได้เลย และดับเบิลคลิกที่ข้อความเพื่อพิมพ์แก้ไขบน canvas โดยตรง
          </div>

          {!isReady ? (
            <div className="mt-4 rounded-2xl border border-[#D9E1F2] bg-white px-4 py-3 text-sm text-[#64748B]">
              กำลังโหลด editor...
            </div>
          ) : null}

          <div className="mt-4 rounded-[1.75rem] border border-[#D9E1F2] bg-white p-4 shadow-[0_18px_40px_-30px_rgba(5,5,121,0.16)] lg:hidden">
            <div className="mb-3 text-sm font-black text-[#050579]">เครื่องมือบนมือถือ</div>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setActiveMobilePanel("quick")}
                className={`rounded-2xl px-3 py-2 text-xs font-black ${activeMobilePanel === "quick" ? "bg-[#050579] text-white" : "bg-[#F8FAFF] text-[#64748B]"}`}
              >
                เร็ว
              </button>
              <button
                type="button"
                onClick={() => setActiveMobilePanel("text")}
                className={`rounded-2xl px-3 py-2 text-xs font-black ${activeMobilePanel === "text" ? "bg-[#050579] text-white" : "bg-[#F8FAFF] text-[#64748B]"}`}
              >
                ข้อความ
              </button>
              <button
                type="button"
                onClick={() => setActiveMobilePanel("background")}
                className={`rounded-2xl px-3 py-2 text-xs font-black ${activeMobilePanel === "background" ? "bg-[#050579] text-white" : "bg-[#F8FAFF] text-[#64748B]"}`}
              >
                พื้นหลัง
              </button>
              <button
                type="button"
                onClick={() => setActiveMobilePanel("layers")}
                className={`rounded-2xl px-3 py-2 text-xs font-black ${activeMobilePanel === "layers" ? "bg-[#050579] text-white" : "bg-[#F8FAFF] text-[#64748B]"}`}
              >
                เลเยอร์
              </button>
            </div>
            <div className="mt-4 space-y-4">{renderMobilePanel()}</div>
          </div>
        </section>
      </main>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUploadImage}
      />

      <div className="sticky bottom-0 z-30 border-t border-[#D9E1F2] bg-white/95 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
          <button
            type="button"
            onClick={undoAction}
            disabled={!canUndo}
            className="rounded-2xl bg-[#050579] px-3 py-3 text-xs font-black text-white disabled:opacity-50"
          >
            ย้อนกลับ
          </button>
          <button
            type="button"
            onClick={redoAction}
            disabled={!canRedo}
            className="rounded-2xl bg-[#FF6B00] px-3 py-3 text-xs font-black text-white disabled:opacity-50"
          >
            ไปข้างหน้า
          </button>
          <button
            type="button"
            onClick={addText}
            className="rounded-2xl bg-[#F8FAFF] px-3 py-3 text-xs font-black text-[#050579]"
          >
            ข้อความ
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-2xl bg-[#FFF5F4] px-3 py-3 text-xs font-black text-[#D64545]"
          >
            รูปภาพ
          </button>
        </div>
      </div>
    </div>
  );
}

import{a as e}from"./index-6887b9a4.js";const n=`Task e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11, e12, e13

Year y2023, y2024, y2025

Quarter q1_2023, q2_2023, q3_2023, q4_2023, q1_2024, q2_2024, q3_2024, q4_2024, q1_2025, q2_2025

q1_2023 := MkQuarter(y2023)
q2_2023 := MkQuarter(y2023)
q3_2023 := MkQuarter(y2023)
q4_2023 := MkQuarter(y2023)

q1_2024 := MkQuarter(y2024)
q2_2024 := MkQuarter(y2024)
q3_2024 := MkQuarter(y2024)
q4_2024 := MkQuarter(y2024)

q1_2025 := MkQuarter(y2025)
q2_2025 := MkQuarter(y2025)

Category outcome, access, milestone

Before(outcome, access)
Before(access, milestone)

e1 := MkTask(q1_2023, q2_2023)
In(e1, outcome)
Label e1 "Web IDE"
e2 := MkTask(q1_2023, q2_2025)
In(e2, milestone)
Label e2 "Enhanced Graphical Features"
e3 := MkTask(q4_2023, q3_2024)
In(e3, access)
Label e3 "Color Accuity Optimization"
e4 := MkTask(q3_2023, q1_2025)
In(e4, outcome)
Label e4 "Integrations: Powerpoint, Canvas, LaTeX, Google Docs, etc."
e5 := MkTask(q4_2023, q4_2024)
In(e5, outcome)
Label e5 "Animation and Progressively-built diagrams"
e6 := MkTask(q1_2023, q1_2024)
In(e6, outcome)
Label e6 "Standard Library that spans DOE Math Curriculum"

e7 := MkTask(q2_2023, q3_2023)
In(e7, access)
Label e7 "Language localization"
e8 := MkTask(q3_2023, q4_2023)
In(e8, access)
Label e8 "Spatially localize alt text"
e9 := MkTask(q1_2024, q2_2025)
In(e9, access)
Label e9 "Semantics-preserving, layout-optimized zoom"

e10 := MkTask(q1_2023, q3_2023)
In(e10, milestone)
Label e10 "Improve Compilation"
e11 := MkTask(q4_2023, q2_2025)
In(e11, milestone)
Label e11 "Interactivity"
e12 := MkTask(q3_2023, q1_2024)
In(e12, milestone)
Label e12 "Temporal specification"
e13 := MkTask(q4_2023, q4_2024)
In(e13, milestone)
Label e13 "Staged optimization"

Label q1_2023 "Q1"
Label q2_2023 "Q2"
Label q3_2023 "Q3"
Label q4_2023 "Q4"

Label q1_2024 "Q1"
Label q2_2024 "Q2"
Label q3_2024 "Q3"
Label q4_2024 "Q4"

Label q1_2025 "Q1"
Label q2_2025 "Q2"

Label y2023 "2023"
Label y2024 "2024"
Label y2025 "2025"`,t=e("timeline"),a=`canvas {
    width = 1200
    height = 550
}

layout = [sort, disjoint]

colors {
    darkgray = #333333
    gray = #D3D3D3
    lightgray = #F5F5F5
    green = #B6DDBF
    purple = #D4CEE8
    blue = #d5e3ff
}

global {
    --- parameters that user may want to tweek
    taskHeight = 35
    taskLabelFontSize = "18px"
    taskFontStyle = "italic"
    periodFontSize = "20px"
    periodFontStyle = "bold"

    fontFamily = "Garamond"

    marginTop = 25
    marginBottom = 25
    marginLeft = 25
    marginRight = 25

    yearHeight = 40
    quarterHeight = 40

    gridLineWeight = 2
    taskStrokeWeight = 1
    taskCornerRadius = 8
    taskPadding = 10

    --- parameters that are calculated
    topGridY = (canvas.height / 2) - marginTop
    topQuarterY = topGridY - yearHeight
    lineY = topQuarterY - quarterHeight
    bottomGridY = -(canvas.height / 2) + marginBottom
    startX =- (canvas.width / 2) + marginLeft
    endX = (canvas.width / 2) - marginRight
    lineLength = endX - startX
    startLine = (startX, lineY)
    endLine = (endX, lineY)
    shape baseline = Line {
        start : startLine
        end : endLine
        strokeWidth : global.gridLineWeight
        strokeColor: colors.gray
    }

}

forall Category c {
    -- compute an HSVA color: H is based on the category index with a random phase shift of [0, 100] degrees. S=30, H=100, and A=100%.
    phaseShift = unitRandom() * 50 
    hue = 360 / match_total * match_id + phaseShift
    c.fillColor = hsva(hue, 30, 100, 1)
}

forall Year y {
    y.minX = ?
    y.maxX = ?
    y.centerX = average2(y.minX, y.maxX)
    y.centerY = global.topGridY - (global.yearHeight / 2)
    y.icon = Text {
        center : (y.centerX, y.centerY)
        string : y.label
        fillColor : colors.darkgray
        fontSize : global.periodFontSize
        fontStyle : global.periodFontStyle
        fontFamily: global.fontFamily
    }
    y.slotBegin = Line {
        start : (y.minX,global.topQuarterY)
        end : (y.minX,global.topGridY)
        strokeWidth : global.gridLineWeight
        strokeColor: colors.gray
    }
    y.slotEnd = Line {
        start : (y.maxX,global.topQuarterY)
        end : (y.maxX,global.topGridY)
        strokeWidth : global.gridLineWeight
        strokeColor: colors.gray
    }
}

forall Quarter q {
    denominator = (match_total * 2)
    index = (match_id - 1) * 2
    startRatio = index / denominator
    middleRatio = (index + 1) / denominator
    endRatio = (index + 2) / denominator
    ratioX = ((match_id * 2) - 1) / (match_total * 2)
    totalSlotX = global.lineLength
    q.startSlotX = global.startX + startRatio * totalSlotX
    q.middleSlotX = global.startX + middleRatio * totalSlotX
    q.endSlotX = global.startX +endRatio * totalSlotX
    q.x = q.middleSlotX
    q.y = global.lineY + (global.quarterHeight / 2)
    q.icon = Text {
        center : (q.x, q.y)
        string : q.label
        fillColor : colors.darkgray
        fontSize : global.periodFontSize
        fontStyle : global.periodFontStyle
        fontFamily: global.fontFamily
    }
    q.slotBegin = Line {
        start : (q.startSlotX,global.bottomGridY)
        end : (q.startSlotX,global.topQuarterY)
        strokeWidth : global.gridLineWeight
        strokeColor: colors.gray
    }
    q.slotEnd = Line {
        start : (q.endSlotX,global.bottomGridY)
        end : (q.endSlotX,global.topQuarterY)
        strokeWidth : global.gridLineWeight
        strokeColor: colors.gray
    }
    layer q.slotEnd below global.baseline
    layer q.slotBegin below global.baseline
}


collect Quarter q into qs
where q := MkQuarter(y)
foreach Year y {
    override y.minX = minList(listof startSlotX from qs)
    override y.maxX = maxList(listof   endSlotX from qs)
}

forall Task e
where e := MkTask(start, end)
with Quarter start; Quarter end;{
    e.centerY = ?
    topBox = e.centerY + global.taskHeight/2
    bottomBox = e.centerY - global.taskHeight/2
    centerX = ((end.endSlotX - start.startSlotX) / 2) + start.startSlotX
    e.icon = Rectangle {
        height : global.taskHeight
        width : end.endSlotX - start.startSlotX
        center: (centerX, e.centerY)
        cornerRadius : global.taskCornerRadius
        strokeWidth : global.taskStrokeWeight
        strokeColor: colors.darkgray
    }

    e.text = Text {
        string : e.label
        fontSize : global.taskLabelFontSize
        fillColor : colors.darkgray
        center : (centerX, e.centerY)
        fontStyle: global.taskFontStyle
        fontFamily: global.fontFamily
    }
    topWithPadding = global.lineY - global.taskPadding
    ensure lessThan(topBox, topWithPadding)
    bottomWithPadding = global.bottomGridY + global.taskPadding
    ensure greaterThan(bottomBox, bottomWithPadding)
    layer e.icon above global.baseline
    layer e.text above e.icon
}

forall Task e 
where In(e, c)
with Category c {
   e.icon.fillColor = c.fillColor
}

forall Task e1; Task e2
where In(e1, c1); In(e2, c2); Before(c2, c1)
with Category c1, c2
{
  ensure e1.centerY > (e2.centerY + global.taskPadding + global.taskHeight) in [sort,disjoint]
}

forall Task e1, e2 {
    ensure disjoint(e1.icon, e2.icon, global.taskPadding) in disjoint
}

-- \`penrose-project-timeline\` styling
forall Task e
where In(e, \`access\`)
with Category \`access\` {
   override e.icon.fillColor = colors.green
}

forall Task e
where In (e, \`milestone\`)
with  Category \`milestone\` {
   override e.icon.fillColor = colors.blue
}

forall Task e
where In(e, \`outcome\`)
with Category \`outcome\` {
   override e.icon.fillColor = colors.purple
}`,o=`type Category
type Quarter 
type Task
type Year

constructor MkTask (Quarter start, Quarter end) -> Task
constructor MkQuarter(Year y) -> Quarter

--seperated category into new predicate to avoid match de-deuplication
predicate In(Task t, Category c)


-- The following predicates (Before, First, and Last) are neccesary to get around Style language
-- limitations related to aggregation.
-- If style aggregation is ever supported the style program should use that feature
-- and these predicates should be removed.

--declares the immediate prior category
predicate Before(Category, Category)
-- declares the first quarter of the year
predicate First(Quarter q, Year y)
-- declares the last quarter of the year
predicate Last(Quarter q, Year y)`,l={substance:n,style:[{contents:a,resolver:t}],domain:o,variation:"ThumperMandrill547",excludeWarnings:[]};export{l as default};

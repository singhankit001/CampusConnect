import pandas as pd
import xlsxwriter

def generate_spreadsheet(input_csv, output_xlsx):
    df = pd.read_csv(input_csv)
    writer = pd.ExcelWriter(output_xlsx, engine='xlsxwriter')
    workbook = writer.book
    
    # Sheet 1: Raw Data
    df.to_excel(writer, sheet_name='Cleaned_Dataset', index=False)
    
    # Sheet 2: Dashboard
    dash = workbook.add_worksheet('Dashboard')
    
    title_fmt = workbook.add_format({'bold': True, 'font_size': 18, 'bg_color': '#4F81BD', 'font_color': 'white'})
    header_fmt = workbook.add_format({'bold': True, 'bg_color': '#DCE6F1'})
    
    dash.write('A1', 'CampusConnect DVA Dashboard', title_fmt)
    dash.set_column('A:A', 25)
    
    # KPIs
    dash.write('A3', 'Total Registrations', header_fmt)
    dash.write('A4', len(df))
    
    dash.write('B3', 'Unique Events', header_fmt)
    dash.write('B4', df['EventName'].nunique())
    
    dash.write('C3', 'Average Feedback', header_fmt)
    dash.write('C4', round(df['FeedbackRating'].mean(), 2))
    
    present = len(df[df['AttendanceStatus'] == 'PRESENT'])
    attendance_rate = (present / len(df)) * 100
    dash.write('D3', 'Attendance Rate', header_fmt)
    dash.write('D4', f"{round(attendance_rate, 2)}%")
    
    # Aggregations for Charts
    # 1. Dept Participation
    dept_counts = df['Department'].value_counts().reset_index()
    dept_counts.columns = ['Department', 'Count']
    dept_counts.to_excel(writer, sheet_name='Dashboard', startrow=7, startcol=0, index=False)
    
    chart1 = workbook.add_chart({'type': 'column'})
    lr1 = 8 + len(dept_counts) - 1
    chart1.add_series({
        'categories': f'=Dashboard!$A$9:$A${lr1}',
        'values':     f'=Dashboard!$B$9:$B${lr1}',
        'name': 'Registrations by Dept'
    })
    dash.insert_chart('E7', chart1)
    
    # 2. Event Popularity
    event_counts = df['EventName'].value_counts().reset_index()
    event_counts.columns = ['Event', 'Count']
    event_counts.to_excel(writer, sheet_name='Dashboard', startrow=25, startcol=0, index=False)
    
    chart2 = workbook.add_chart({'type': 'pie'})
    lr2 = 26 + len(event_counts) - 1
    chart2.add_series({
        'categories': f'=Dashboard!$A$27:$A${lr2}',
        'values':     f'=Dashboard!$B$27:$B${lr2}',
        'name': 'Event Popularity'
    })
    dash.insert_chart('E25', chart2)
    
    writer.close()
    print(f"Generated Spreadsheet Dashboard: {output_xlsx}")

if __name__ == "__main__":
    generate_spreadsheet('cleaned_data.csv', 'CampusConnect_Dashboard.xlsx')

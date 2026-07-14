import pandas as pd
import xlsxwriter

def create_excel_dashboard(input_file, output_file):
    print(f"Reading cleaned data from {input_file}...")
    df = pd.read_csv(input_file)
    
    # Create an Excel writer object using xlsxwriter
    writer = pd.ExcelWriter(output_file, engine='xlsxwriter')
    workbook = writer.book
    
    # Write the raw data to a sheet
    df.to_excel(writer, sheet_name='Cleaned_Data', index=False)
    
    # Create the Dashboard Sheet
    dashboard_sheet = workbook.add_worksheet('Dashboard')
    
    # Formatting
    title_format = workbook.add_format({'bold': True, 'font_size': 20, 'font_color': '#2C3E50', 'bg_color': '#ECF0F1'})
    header_format = workbook.add_format({'bold': True, 'bg_color': '#34495E', 'font_color': 'white'})
    
    dashboard_sheet.write('A1', 'CampusConnect Analytics Dashboard', title_format)
    dashboard_sheet.set_column('A:A', 20)
    
    # KPI 1: Total Students
    dashboard_sheet.write('A3', 'Total Students', header_format)
    dashboard_sheet.write('A4', len(df))
    
    # KPI 2: Average CGPA
    dashboard_sheet.write('B3', 'Average CGPA', header_format)
    dashboard_sheet.write('B4', round(df['CGPA'].mean(), 2))
    
    # KPI 3: Avg Attendance
    dashboard_sheet.write('C3', 'Avg Attendance %', header_format)
    dashboard_sheet.write('C4', f"{round(df['AttendanceRate'].mean(), 1)}%")
    
    # Pivot Table 1: Students per Department
    dept_counts = df['Department'].value_counts().reset_index()
    dept_counts.columns = ['Department', 'Count']
    dept_counts.to_excel(writer, sheet_name='Dashboard', startrow=7, startcol=0, index=False)
    
    # Chart 1: Department Distribution (Column Chart)
    chart1 = workbook.add_chart({'type': 'column'})
    last_row = 8 + len(dept_counts) - 1
    chart1.add_series({
        'name': 'Students',
        'categories': f'=Dashboard!$A$9:$A${last_row}',
        'values':     f'=Dashboard!$B$9:$B${last_row}',
        'fill':       {'color': '#3498DB'}
    })
    chart1.set_title({'name': 'Students by Department'})
    dashboard_sheet.insert_chart('E7', chart1)
    
    # Pivot Table 2: Placement Status Funnel
    placement_counts = df['InternshipStatus'].value_counts().reset_index()
    placement_counts.columns = ['Status', 'Count']
    placement_counts.to_excel(writer, sheet_name='Dashboard', startrow=25, startcol=0, index=False)
    
    # Chart 2: Placement Funnel (Bar Chart)
    chart2 = workbook.add_chart({'type': 'bar'})
    last_row_2 = 26 + len(placement_counts) - 1
    chart2.add_series({
        'name': 'Applications',
        'categories': f'=Dashboard!$A$27:$A${last_row_2}',
        'values':     f'=Dashboard!$B$27:$B${last_row_2}',
        'fill':       {'color': '#2ECC71'}
    })
    chart2.set_title({'name': 'Internship Application Pipeline'})
    dashboard_sheet.insert_chart('E25', chart2)
    
    writer.close()
    print(f"Successfully generated interactive Excel Dashboard at {output_file}")

if __name__ == "__main__":
    create_excel_dashboard('cleaned_data.csv', 'CampusConnect_Dashboard.xlsx')
